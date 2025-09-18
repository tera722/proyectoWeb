import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { HttpClientModule } from '@angular/common/http';
import { InventarioService } from '../../services/inventario.service';


@Component({
  selector: 'app-producto', 
  standalone:true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './producto.component.html',
  styleUrls : ['./producto.component.css'],
  providers: [ProductoService]
})
export class ProductoComponent implements OnInit {
  productos: any[]=[]
  constructor(
    private productoService:ProductoService,
    private carritoService:CarritoService,
    private router:Router){}
    ngOnInit(): void {
      this.productoService.obtenerProductos().subscribe({
        next: (productos) => {
          this.productos = productos;
        },
        error: (error) => {
          console.error('Error al obtener los productos', error);
        }
      });
    }
  agregarAlCarrito(producto:Producto){
    this.carritoService.agregarProducto(producto);
  }
  irAlCarrito(){
    this.router.navigate(['/carrito']);
  }
  irAlInventario(): void {
    this.router.navigate(['/inventario']); 
  }
}
 