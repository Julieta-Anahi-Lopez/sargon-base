from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from apps.users.models import Contactos, WebUsuarios


class Command(BaseCommand):
    help = "Crea el primer usuario vendedor (catusu='V') necesario para operar el sistema."

    def add_arguments(self, parser):
        parser.add_argument("--nombre",  default="Vendedor Admin",         help="Nombre completo")
        parser.add_argument("--email",   required=True,                    help="Email de login")
        parser.add_argument("--clave",   default="admin1234",              help="Contraseña inicial")
        parser.add_argument("--nrodoc",  default="00000001",               help="DNI (debe ser único)")
        parser.add_argument("--locali",  default=8000,    type=int,        help="Código de localidad")
        parser.add_argument("--cp",      default="8000",                   help="Código postal")

    def handle(self, *args, **options):
        email   = options["email"].strip()
        nrodoc  = options["nrodoc"].strip()
        nombre  = options["nombre"].strip()
        clave   = options["clave"]
        locali  = options["locali"]
        cp      = options["cp"]

        # Validaciones previas
        if WebUsuarios.objects.filter(e_mail=email).exists():
            raise CommandError(f"Ya existe un usuario con el email '{email}'.")
        if WebUsuarios.objects.filter(nrodoc=nrodoc).exists():
            raise CommandError(f"Ya existe un usuario con el DNI '{nrodoc}'.")

        with transaction.atomic():
            # Reusar el contacto si ya existe por DNI, o crear uno nuevo
            contacto_existente = Contactos.objects.filter(nrodoc=nrodoc).first()
            if contacto_existente:
                nrocon = contacto_existente.nrocon
                self.stdout.write(f"  Contacto existente encontrado (nrocon={nrocon}), reutilizando.")
            else:
                ultimo = Contactos.objects.order_by("-nrocon").first()
                nrocon = (ultimo.nrocon + 1) if ultimo else 1

                Contactos.objects.create(
                    nroemp=1,
                    nrocon=nrocon,
                    nombre=nombre,
                    locali=locali,
                    cp=cp,
                    cativa="CF",
                    nrodoc=nrodoc,
                    e_mail=email,
                    observ="Vendedor creado por comando de gestión",
                )
                self.stdout.write(f"  Contacto creado (nrocon={nrocon}).")

            WebUsuarios.objects.create(
                codigo=nrocon,
                nombre=nombre,
                clave=clave,
                e_mail=email,
                catusu="V",
                gposeg=0,
                nrodoc=nrodoc,
            )

        self.stdout.write(self.style.SUCCESS(
            f"\nVendedor creado correctamente.\n"
            f"  Email : {email}\n"
            f"  Clave : {clave}\n"
            f"  Código: {nrocon}\n"
            f"\nCambiá la contraseña después del primer login."
        ))
