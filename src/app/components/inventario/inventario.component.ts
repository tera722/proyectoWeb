

import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { Producto } from '../../models/producto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inventario',
  standalone:true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],

})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];


  nuevoProducto: Producto = { id: 0, nombre: '', precioP: 0, imagen: '' }; // Nuevo producto
  productoSeleccionado: Producto | null = null; // Producto seleccionado para editar

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.inventarioService.productos$.subscribe({
      next: (productos) => {
        this.productos = productos;
        console.log('Productos en el componente:', this.productos); // Depuración
      },
      error: (error) => {
        console.error('Error al obtener productos:', error); // Depuración
      }
    });
  }


  // Método para agregar un nuevo producto
  agregarProducto(): void {
    this.inventarioService.agregarProducto(this.nuevoProducto);
    this.nuevoProducto = { id: 0, nombre: '', precioP: 0, imagen: '' }; // Limpiar el formulario
    // Recargar la lista de productos
    this.inventarioService.obtenerProductos().subscribe(productos => {
      this.productos = productos;
    });
  }

  // Método para seleccionar un producto para editar
  editarProducto(producto: Producto): void {
    this.productoSeleccionado = { ...producto }; // Clonar el producto para evitar modificar el original directamente
  }

  // Método para guardar los cambios
  guardarCambios(): void {
    if (this.productoSeleccionado) {
      this.inventarioService.modificarProducto(this.productoSeleccionado.id, this.productoSeleccionado);
      this.cancelarEdicion();
      // Recargar la lista de productos
      this.inventarioService.obtenerProductos().subscribe(productos => {
        this.productos = productos;
      });
    }
  }

  // Método para cancelar la edición
  cancelarEdicion(): void {
    this.productoSeleccionado = null;
  }

  // Método para eliminar un producto
  eliminarProducto(id: number): void {
    this.inventarioService.eliminarProducto(id);
    // Recargar la lista de productos
    this.inventarioService.obtenerProductos().subscribe(productos => {
      this.productos = productos;
    });
  }
  descargarXML(): void {
    this.inventarioService.descargarXML();
  }

}