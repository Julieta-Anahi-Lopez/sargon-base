// types/index.ts
// Archivo centralizado de tipos e interfaces del proyecto

// ============================================
// TIPOS DE USUARIO Y AUTENTICACIÓN
// ============================================

export interface User {
  codigo: number;
  nombre: string;
  email: string;
  catusu: string;
  domcal?: string;
  domnro?: string;
  cuit?: string;
  dni?: string;
  catIva?: string;
  cativa?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface LoginCredentials {
  email: string;
  clave: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// ============================================
// TIPOS DE PRODUCTOS
// ============================================

export interface ProductImage {
  foto_1: string;
}

export interface Product {
  codigo: string;
  nombre: string;
  observ: string;
  precio_final: number;
  neto?: number;
  stock: number;
  imagenes: ProductImage[];
}

// ============================================
// TIPOS DE CARRITO
// ============================================

export interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  image: string;
  stock?: number;
}

export interface CartState {
  items: CartItem[];
}

export interface RemoveFromCartPayload {
  codigo: string;
  removeCompletely?: boolean;
}

// ============================================
// TIPOS DE FILTROS
// ============================================

export interface FiltersState {
  category: string | null;
  subcategory: string | null;
  precio_max: number | null;
  nromar: string | null;
  nombre: string | null;
  ordering: string | null;
  solo_stock: boolean;
}

export interface ProductFilters {
  category?: string | null;
  subcategory?: string | null;
  precio_max?: number | null;
  nromar?: string | null;
  nombre?: string | null;
  ordering?: string | null;
  solo_stock?: boolean;
}

// ============================================
// TIPOS DE PEDIDOS
// ============================================

export interface PedidoDetalle {
  compro: string;
  nroord: number;
  codart: string;
  cantid: number;
  descri: string;
  penden: number;
  pendfc: number;
  precio: number;
  nrolis: number;
  pordes: number;
  nroemp: number;
  observ: string;
  poruni: number;
}

export interface Pedido {
  compro: string;
  detalles: PedidoDetalle[];
  nrocli: number;
  fecped: string;
  plazo: string;
  lugent: string;
  condic: string;
  observ: string;
  nrousu: number;
  nroven: number;
  imputa: number;
  nombpc: string;
  origen: string;
  nroemp: number;
  tipdep: number;
  nroest: string;
}

export interface OrderState {
  loading: boolean;
  success: boolean;
  error: string | null;
  orderId: string | null;
}

export interface OrderItem {
  codigo: string;
  cantidad: number;
  precio: number;
}

// ============================================
// TIPOS DE CATEGORÍAS Y RUBROS
// ============================================

export interface SubRubro {
  nrorub: number;
  codigo: number;
  nombre: string;
}

export interface Rubro {
  codigo: number;
  nombre: string;
  verweb?: string;
  nrodep?: string;
  subrubros: SubRubro[];
}

export interface Marca {
  codigo: number;
  nombre: string;
  nromar?: number;
  verweb?: number;
}

// ============================================
// TIPOS DE COMPONENTES UI
// ============================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export interface CarouselSlide {
  image: string;
  title?: string;
  subtitle?: string;
}

export interface CarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  interval?: number;
}

export interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  id?: string;
}

// ============================================
// TIPOS DE FORMULARIOS
// ============================================

export interface RegisterFormData {
  nombre: string;
  email: string;
  clave: string;
  confirmarClave: string;
  telefono?: string;
  direccion?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// ============================================
// TIPOS DE API
// ============================================

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginatedProductsResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface StockErrorItem {
  codigo: string;
  solicitado: number;
  disponible: number;
}

// Resultado de enviar un pedido. success=false + stockError indica stock insuficiente
// (el carrito NO debe limpiarse en ese caso).
export interface OrderResult {
  success: boolean;
  stockError?: StockErrorItem[];
}

// ============================================
// TIPOS DE REDUX STORE
// ============================================

export interface RootState {
  auth: AuthState;
  cart: CartState;
  filters: FiltersState;
  order: OrderState;
}
