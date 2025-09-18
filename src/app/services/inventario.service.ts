import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Producto } from '../models/producto';
import { map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private xmlUrl = 'assets/productos.xml'; // Ruta al archivo XML
  private productos: Producto[] = [];
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.cargarProductosDesdeXML().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.productosSubject.next(productos); // Notificar que los productos están listos
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }
  private cargarProductosDesdeXML(): Observable<Producto[]> {
    return this.http.get(this.xmlUrl, { responseType: 'text' }).pipe(
      map((xml) => {
        if (isPlatformBrowser(this.platformId)) {
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'text/xml');
            console.log('XML cargado:', xmlDoc); // Depuración
  
            const productos = Array.from(xmlDoc.querySelectorAll('producto')).map((prod) => ({
              id: Number(prod.getElementsByTagName('id')[0]?.textContent) || 0,
              nombre: prod.getElementsByTagName('nombre')[0]?.textContent ?? 'Sin nombre',
              precioP: Number(prod.getElementsByTagName('precio')[0]?.textContent) || 0,
              imagen: prod.getElementsByTagName('imagen')[0]?.textContent ?? 'sin_imagen.jpg'
            }));
  
            console.log('Productos parseados:', productos); // Depuración
            return productos;
          } catch (error) {
            console.error('Error al parsear el XML:', error);
            return [];
          }
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error al cargar el XML:', error);
        return of([]); // Devuelve un arreglo vacío en caso de error
      })
    );
  }

  obtenerProductos(): Observable<Producto[]> {
    return of(this.productos); // Devuelve los productos en memoria
  }

  agregarProducto(producto: Producto): void {
    producto.id = this.productos.length + 1; // Asignar un nuevo ID
    this.productos.push(producto); // Agregar el producto al arreglo en memoria
    this.actualizarXML(); // Simular la actualización del XML
  }

  modificarProducto(id: number, productoActualizado: Producto): void {
    const index = this.productos.findIndex(p => p.id === id);
    if (index !== -1) {
      this.productos[index] = { ...productoActualizado, id }; // Actualizar el producto
      this.actualizarXML(); // Simular la actualización del XML
    }
  }

  eliminarProducto(id: number): void {
    this.productos = this.productos.filter(p => p.id !== id); // Filtrar y eliminar el producto
    this.actualizarXML(); // Simular la actualización del XML
  }

  private actualizarXML(): void {
    // Simular la actualización del XML generando un nuevo XML a partir del arreglo en memoria
    const xmlString = this.generarXMLDesdeProductos(this.productos);
    console.log('XML actualizado:', xmlString);
  }

  private generarXMLDesdeProductos(productos: Producto[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const productosXML = productos.map(prod => `
      <producto>
        <id>${prod.id}</id>
        <nombre>${prod.nombre}</nombre>
        <precio>${prod.precioP}</precio>
        <imagen>${prod.imagen}</imagen>
      </producto>
    `).join('');
  
    return `${xmlHeader}<productos>${productosXML}</productos>`;
  }
  
  descargarXML(): void {
    const xmlString = this.generarXMLDesdeProductos(this.productos);
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
  
    // Crear un enlace temporal para la descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario.xml'; // Nombre del archivo
    document.body.appendChild(a);
    a.click(); // Simular clic en el enlace
    document.body.removeChild(a); // Eliminar el enlace temporal
    window.URL.revokeObjectURL(url); // Liberar el objeto URL
  }
}