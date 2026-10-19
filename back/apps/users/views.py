import logging

import requests as http_requests
from django.conf import settings
from django.core import signing
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status, views
from rest_framework.decorators import action
from django.db import transaction
from rest_framework.throttling import AnonRateThrottle
from .models import Contactos, WebUsuarios, WebCarrito


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'
from .serializers import (
    ContactosSerializer,
    WebUsuariosListSerializer,
    WebUsuariosCreateUpdateSerializer,
    CustomTokenObtainPairSerializer,
    CustomTokenRefreshSerializer,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsVendedor
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

logger = logging.getLogger(__name__)


class ContactosViewSet(viewsets.ModelViewSet):  # Solo permite GET
    serializer_class = ContactosSerializer

    def get_queryset(self):
        return Contactos.objects.all() 
    
class WebUsuariosViewSet(viewsets.ModelViewSet):

    def get_permissions(self):
        # Solo vendedores (catusu='V') pueden crear usuarios; el resto requiere autenticación
        if self.action == 'create':
            return [IsVendedor()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # Cada usuario solo puede ver y modificar su propio registro
        if not self.request.user.is_authenticated:
            return WebUsuarios.objects.none()
        return WebUsuarios.objects.filter(codigo=self.request.user.codigo)

    def get_serializer_class(self):
        # Devuelve un serializer diferente según la acción
        if self.action in ['list', 'retrieve']:
            return WebUsuariosListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return WebUsuariosCreateUpdateSerializer
        # Serializer por defecto si no coincide con ninguna acción específica
        return WebUsuariosListSerializer
    
    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            try:
                nrocon_existente = request.data.get('nrocon_existente')
                email = request.data.get('e_mail')

                if not email:
                    return Response({'error': 'El email es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

                if WebUsuarios.objects.filter(e_mail=email).exists():
                    return Response({'error': 'Ya existe un usuario web con este email'}, status=status.HTTP_400_BAD_REQUEST)

                # Flujo A: contacto existente buscado por número de cliente
                if nrocon_existente:
                    try:
                        contacto = Contactos.objects.get(nrocon=nrocon_existente)
                    except Contactos.DoesNotExist:
                        return Response({'error': f'No existe un contacto con el número {nrocon_existente}'}, status=status.HTTP_400_BAD_REQUEST)

                    web_usuario_existente = WebUsuarios.objects.filter(codigo=contacto.nrocon).first()
                    if web_usuario_existente:
                        if web_usuario_existente.e_mail:
                            return Response({'error': 'Este cliente ya tiene un usuario web con acceso habilitado'}, status=status.HTTP_400_BAD_REQUEST)
                        # Registro legacy sin email: UPDATE directo (evita validación de tipos legacy)
                        WebUsuarios.objects.filter(codigo=contacto.nrocon).update(
                            e_mail=email,
                            clave=request.data.get('clave', '1234'),
                            nombre=contacto.nombre,
                            telcel=contacto.telcel,
                            nrodoc=contacto.nrodoc or '',
                        )
                        # No hacemos get() — la tabla legacy puede tener campos con '' en IntegerFields
                        return Response({
                            'codigo':     contacto.nrocon,
                            'nombre':     contacto.nombre,
                            'actualizado': True,
                        }, status=status.HTTP_200_OK)

                # Flujo B: contacto nuevo
                else:
                    if not request.data.get('nrodoc'):
                        return Response({'error': 'El DNI es obligatorio para crear un contacto nuevo'}, status=status.HTTP_400_BAD_REQUEST)
                    nrodoc = request.data.get('nrodoc')
                    if WebUsuarios.objects.filter(nrodoc=nrodoc).exists():
                        return Response({'error': 'Ya existe un usuario web con este DNI'}, status=status.HTTP_400_BAD_REQUEST)
                    contacto = self._crear_contacto(request.data)

                usuario_data = {
                    'codigo': contacto.nrocon,
                    'nombre': contacto.nombre,
                    'clave': request.data.get('clave', '1234'),
                    'e_mail': email,
                    'catusu': request.data.get('catusu', 'C'),
                    'gposeg': request.data.get('gposeg', 0),
                    'telcel': contacto.telcel,
                    'nrodoc': contacto.nrodoc,
                }

                web_usuario = WebUsuarios.objects.create(**usuario_data)
                serializer = WebUsuariosListSerializer(web_usuario)
                headers = self.get_success_headers(serializer.data)

                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response(
                    {'error': f'Error inesperado: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            # Lógica personalizada para la actualización
            self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'], url_path='buscar', permission_classes=[IsVendedor])
    def buscar(self, request):
        email  = request.query_params.get('email',  '').strip()
        nrocon = request.query_params.get('nrocon', '').strip()

        if not email and not nrocon:
            return Response({'error': 'Ingresá email o número de cliente'}, status=status.HTTP_400_BAD_REQUEST)

        if email:
            usuario = WebUsuarios.objects.filter(e_mail__iexact=email).first()
        else:
            try:
                usuario = WebUsuarios.objects.filter(codigo=int(nrocon)).first()
            except ValueError:
                return Response({'error': 'El número de cliente debe ser numérico'}, status=status.HTTP_400_BAD_REQUEST)

        if not usuario:
            return Response({'error': 'No se encontró ningún usuario web con ese dato'}, status=status.HTTP_404_NOT_FOUND)

        try:
            contacto = Contactos.objects.get(nrocon=usuario.codigo)
            nombre_contacto = contacto.nombre
        except Contactos.DoesNotExist:
            nombre_contacto = usuario.nombre

        return Response({
            'codigo':          usuario.codigo,
            'nombre':          nombre_contacto,
            'e_mail':          usuario.e_mail,
            'catusu':          usuario.catusu,
        })

    @action(detail=False, methods=['delete'], url_path='eliminar', permission_classes=[IsVendedor])
    def eliminar(self, request):
        codigo = request.data.get('codigo')
        if not codigo:
            return Response({'error': 'codigo es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            usuario = WebUsuarios.objects.filter(codigo=codigo).first()
            if not usuario:
                return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            nombre = usuario.nombre
            WebCarrito.objects.filter(nrocli=codigo).delete()
            WebUsuarios.objects.filter(codigo=codigo).delete()

        return Response({'ok': True, 'nombre': nombre})

    @action(detail=False, methods=['patch'], url_path='editar', permission_classes=[IsVendedor])
    def editar(self, request):
        codigo_actual = request.data.get('codigo_actual')
        nuevo_nrocon  = request.data.get('nuevo_nrocon')
        nuevo_email   = request.data.get('e_mail', '').strip() or None
        nueva_clave   = request.data.get('clave', '').strip() or None

        if not codigo_actual:
            return Response({'error': 'codigo_actual es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            usuario = WebUsuarios.objects.filter(codigo=codigo_actual).first()
            if not usuario:
                return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            update_fields = {}

            if nuevo_email and nuevo_email != usuario.e_mail:
                if WebUsuarios.objects.filter(e_mail__iexact=nuevo_email).exclude(codigo=codigo_actual).exists():
                    return Response({'error': 'Ya existe un usuario con ese email'}, status=status.HTTP_400_BAD_REQUEST)
                update_fields['e_mail'] = nuevo_email

            if nueva_clave:
                if len(nueva_clave) > 8:
                    return Response({'error': 'La contraseña no puede superar 8 caracteres'}, status=status.HTTP_400_BAD_REQUEST)
                update_fields['clave'] = nueva_clave

            codigo_final = codigo_actual
            nombre_final = usuario.nombre

            if nuevo_nrocon and int(nuevo_nrocon) != int(codigo_actual):
                nuevo_nrocon = int(nuevo_nrocon)
                try:
                    contacto = Contactos.objects.get(nrocon=nuevo_nrocon)
                except Contactos.DoesNotExist:
                    return Response({'error': f'No existe ningún cliente con el número {nuevo_nrocon}'}, status=status.HTTP_400_BAD_REQUEST)

                if WebUsuarios.objects.filter(codigo=nuevo_nrocon).exists():
                    return Response({'error': 'Ese número de cliente ya tiene un usuario web asignado'}, status=status.HTTP_400_BAD_REQUEST)

                # Mover el carrito al nuevo NroCon (las filas pertenecen al cliente correcto)
                WebCarrito.objects.filter(nrocli=codigo_actual).update(nrocli=nuevo_nrocon)

                update_fields['codigo'] = nuevo_nrocon
                update_fields['nombre'] = (contacto.nombre or '')[:40]
                codigo_final = nuevo_nrocon
                nombre_final = contacto.nombre

            if not update_fields:
                return Response({'error': 'No hay cambios para guardar'}, status=status.HTTP_400_BAD_REQUEST)

            WebUsuarios.objects.filter(codigo=codigo_actual).update(**update_fields)

            return Response({
                'ok':     True,
                'codigo': codigo_final,
                'nombre': nombre_final,
            })

    def _es_localidad_lista_cero(self, codigo_postal: str) -> bool:
        # Lista de códigos postales válidos (como strings)
        codigos_validos = {
            "8000",  # Bahía Blanca
            "8105",  # General Daniel Cerri
            "8109",  # Punta Alta
            "8150",  # Coronel Dorrego
            "8153",  # Monte Hermoso
            "8103",  # Ingeniero White
            "8160",  # Tornquist
            "7530",  # Coronel Pringles
            "8168",  # Sierra de la Ventana
            "8118",  # Cabildo
            "8170",  # Pigue
        }

        return str(codigo_postal) in codigos_validos

    
    def _crear_contacto(self, data):
        nro_emp = data.get('nroemp', 1)
        nrocon = Contactos.objects.all().order_by('-nrocon').first().nrocon + 1
        nombre = data.get('nombre', 'Sin nombre')
        domCalle = data.get('domcalle', 'Sin calle')
        domnro = data.get('domnro', 'SN')
        dompis = data.get('dompis', 'SP')
        domdep = data.get('domdep', 'Sdep')
        locali = data.get('locali', None)
        cp = data.get('cp', str(locali)[-4:])
        provin = data.get('provin', 1)
        telefo = data.get('telefo', 'Sin telefono')
        fax = data.get('fax', 'Sin fax')
        telcel = data.get('telcel', 'Sin celular')
        e_mail = data.get('e_mail', None)
        fecnac = data.get('fecnac', '1900-01-01')
        cuit = data.get('cuit', None)
        cativa = data.get('cativa', None)
        porcib = data.get('porcib', 0)
        catgan = data.get('catgan', '0')
        observ = data.get('observ', 'Contacto creado desde la web')
        escli = data.get('escli', 1)
        espro = data.get('espro', 0)
        obspos = data.get('obspos', 'Sin observaciones')
        ingbto = data.get('ingbto', 'Sin ingresos brutos')
        dirweb = data.get('dirweb', 'Sin direccion web')
        calenv = data.get('calenv', 'Sin calle envio')
        nroenv = data.get('nroenv', 'SN')
        locenv = data.get('locali', 8000)
        codenv = data.get('codenv', str(locenv)[-4:])
        telenv = data.get('telenv', 'Sin telefono envio')
        transp = data.get('transp', 'Sin transporte')
        pordes = data.get('pordes', 0)
        vtocta = data.get('vtocta', 30)
        vtopro = data.get('vtopro', 0)
        nroven = data.get('nroven', 0)
        vtoins = data.get('vtoins', '1900-01-01')
        descu1 = data.get('descu1', 0)
        descu2 = data.get('descu2', 0)
        nrodoc = data.get('nrodoc', None)
        porfle = data.get('porfle', 0)
        nrocbu = data.get('nrocbu', 'Sin nro cbu')
        sincta = data.get('sincta', 0)
        cheque = data.get('cheque', 'Sin cheque')
        exeley = data.get('exeley', 0)
        calcli = data.get('calcli', 0)
        clifac = data.get('clifac', 0)
        dto567 = data.get('dto567', False)
        nomdes = data.get('nomdes', 'Sin nombre destino')
        docdes = data.get('docdes', 'Sin doc')
        obstra = data.get('obstra', 'Sin observaciones transporte')
        grande = data.get('grande', False)
        cbuinf = data.get('cbuinf', False)
        periva = data.get('periva', 0)

        logger.debug("Creando contacto — locali=%s, cp=%s", locali, cp)

        if not locali:
            raise ValueError('El campo localidad es obligatorio')
        if nrodoc is None:
            raise ValueError('El DNI es obligatorio')
        if e_mail is None:
            raise ValueError('El email es obligatorio')
        if cativa in ('1', '7') and not cuit:
            raise ValueError('El CUIT es obligatorio para Responsable Inscripto y Monotributista')

        nrolis = 0 if self._es_localidad_lista_cero(locali) else 1
        logger.debug("Lista de precios asignada: %s", nrolis)

        if Contactos.objects.filter(nrodoc=nrodoc).exists():
            contacto_existente = Contactos.objects.get(nrodoc=nrodoc)
            logger.info("Contacto existente encontrado por DNI: %s", contacto_existente)
            return contacto_existente

        contacto, creado = Contactos.objects.get_or_create(
            nroemp=nro_emp,
            nrocon=nrocon,
            nombre=nombre,
            domcal=domCalle,
            domnro=domnro,
            dompis=dompis,
            domdep=domdep,
            locali=locali,
            cp=cp,
            provin=provin,
            telefo=telefo,
            fax=fax,
            telcel=telcel,
            e_mail=e_mail,
            fecnac=fecnac,
            cuit=cuit,
            cativa=cativa,
            porcib=porcib,
            catgan=catgan,
            observ=observ,
            escli=escli,
            espro=espro,
            obspos=obspos,
            ingbto=ingbto,
            dirweb=dirweb,
            calenv=calenv,
            nroenv=nroenv,
            locenv=locenv,
            codenv=codenv,
            telenv=telenv,
            transp=transp,
            pordes=pordes,
            vtocta=vtocta,
            vtopro=vtopro,
            nroven=nroven,
            vtoins=vtoins,
            descu1=descu1,
            descu2=descu2,
            nrodoc=nrodoc,
            porfle=porfle,
            nrocbu=nrocbu,
            nrolis=nrolis,
            sincta=sincta,
            cheque=cheque,
            exeley=exeley,
            calcli=calcli,
            clifac=clifac,
            dto567=dto567,
            nomdes=nomdes,
            docdes=docdes,
            obstra=obstra,
            grande=grande,
            cbuinf=cbuinf,
            periva=periva,
        )
        if creado:
            logger.info("Contacto creado: %s", contacto)
        else:
            logger.info("Contacto ya existente: %s", contacto)
        return contacto




class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        clave = request.data.get('clave')

        if not email or not clave:
            return Response(
                {'error': 'Debe proporcionar email y contraseña'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = WebUsuarios.objects.get(e_mail=email)

            if user.clave != clave:
                return Response(
                    {'error': 'Credenciales inválidas'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Buscar el contacto asociado por codigo == nrocon
            try:
                contacto = Contactos.objects.get(nrocon=user.codigo)
            except Contactos.DoesNotExist:
                return Response(
                    {'error': 'No se encontró el contacto asociado al usuario'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            refresh = RefreshToken.for_user(user)
            cativa=contacto.cativa
            if cativa == '1':
                cativa = 'Responsable Inscripto'
            elif cativa == '7':
                cativa = 'Monotributista'
            elif cativa == '4':
                cativa = 'Consumidor Final'
            else: 
                cativa = 'Otra'

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'codigo': user.codigo,
                    'nombre': user.nombre,
                    'email': user.e_mail,
                    'catusu': user.catusu,
                    'domcal': contacto.domcal,
                    'domnro': contacto.domnro,
                    'cuit': contacto.cuit,
                    'dni': contacto.nrodoc,
                    'catIva': cativa,
                }
            })

        except WebUsuarios.DoesNotExist:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class MeView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            contacto = Contactos.objects.get(nrocon=user.codigo)
        except Contactos.DoesNotExist:
            return Response(
                {'error': 'No se encontró el contacto asociado al usuario'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        cativa_map = {
            '1': 'Responsable Inscripto',
            '7': 'Monotributista',
            '4': 'Consumidor Final',
        }
        cativa = cativa_map.get(contacto.cativa, 'Otra')

        return Response({
            'codigo': user.codigo,
            'nombre': user.nombre,
            'email': user.e_mail,
            'catusu': user.catusu,
            'domcal': contacto.domcal,
            'domnro': contacto.domnro,
            'cuit': contacto.cuit,
            'dni': contacto.nrodoc,
            'catIva': cativa,
        })


class CustomTokenRefreshView(TokenRefreshView):
    """
    Vista personalizada para refrescar tokens JWT
    Usa nuestro serializador personalizado
    """
    serializer_class = CustomTokenRefreshSerializer


def _send_reset_email(to_email: str, nombre: str, reset_url: str) -> None:
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <p style="color:#2A5215;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">
        Ser Natural
      </p>
      <h2 style="color:#1c1917;margin-top:8px;">Recuperación de contraseña</h2>
      <p style="color:#57534e;">Hola {nombre},</p>
      <p style="color:#57534e;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Hacé clic en el botón para elegir una nueva.
      </p>
      <a href="{reset_url}"
         style="display:inline-block;margin:16px 0;background:#2A5215;color:#fff;
                padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
        Restablecer contraseña
      </a>
      <p style="color:#a8a29e;font-size:12px;">El enlace expira en 1 hora.</p>
      <p style="color:#a8a29e;font-size:12px;">
        Si no solicitaste este cambio, ignorá este email.
      </p>
    </div>
    """
    http_requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": "Ser Natural <noreply@aloedevs.com>",
            "to": [to_email],
            "subject": "Recuperación de contraseña - Ser Natural",
            "html": html,
        },
        timeout=10,
    ).raise_for_status()


class PasswordResetRequestView(views.APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        logger.info("[password-reset] solicitud para email='%s'", email)

        if not email:
            return Response({'error': 'Email requerido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = WebUsuarios.objects.get(e_mail__iexact=email, catusu='C')
            logger.info("[password-reset] usuario encontrado: codigo=%s catusu=%s", user.codigo, user.catusu)
            token = signing.dumps(user.codigo, salt='password-reset')
            reset_url = f"{settings.FRONTEND_URL}/nueva-password?token={token}"
            logger.info("[password-reset] intentando enviar email a '%s' con url=%s", user.e_mail, reset_url)
            _send_reset_email(user.e_mail, user.nombre or 'Usuario', reset_url)
            logger.info("[password-reset] email enviado correctamente a '%s'", user.e_mail)
        except WebUsuarios.DoesNotExist:
            logger.warning("[password-reset] no existe WebUsuario con e_mail='%s' y catusu='C'", email)
        except Exception as exc:
            logger.error("[password-reset] error al enviar email a '%s': %s", email, exc, exc_info=True)

        return Response({
            'message': 'Si el email está registrado, recibirás un correo con instrucciones.'
        })


class PasswordResetConfirmView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token', '').strip()
        nueva_clave = request.data.get('nueva_clave', '')

        if not token or not nueva_clave:
            return Response(
                {'error': 'Token y nueva contraseña son requeridos'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(nueva_clave) > 8:
            return Response(
                {'error': 'La contraseña no puede superar los 8 caracteres'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            codigo = signing.loads(token, salt='password-reset', max_age=3600)
        except signing.SignatureExpired:
            return Response(
                {'error': 'El enlace expiró. Solicitá uno nuevo.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except signing.BadSignature:
            return Response(
                {'error': 'Enlace inválido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = WebUsuarios.objects.get(codigo=codigo, catusu='C')
        except (WebUsuarios.DoesNotExist, WebUsuarios.MultipleObjectsReturned):
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_400_BAD_REQUEST)

        user.clave = nueva_clave
        user.save(update_fields=['clave'])
        return Response({'ok': True})