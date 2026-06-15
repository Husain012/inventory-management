import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../models/product';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  loading = false;

  // Toast
  toastMessage = '';
  toastType = '';
  showToast = false;
  sortColumn: keyof Product | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Delete modal
  showDeleteModal = false;
  deleteTargetId: number | null = null;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.allProducts = [...data];
        this.products = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  // onSearch(event: Event) {
  //   const value = (event.target as HTMLInputElement).value.toLowerCase();
  //   this.products = this.allProducts.filter(p =>
  //     p.name.toLowerCase().includes(value) ||
  //     p.category.toLowerCase().includes(value)
  //   );
  // }
  onSearch(event: Event): void {

  const searchTerm =
    (event.target as HTMLInputElement)
      .value
      .toLowerCase();

  this.products = this.allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );

  if (this.sortColumn) {
    this.sortProducts(this.sortColumn);
  }
}

  confirmDelete(id: number) {
    this.deleteTargetId = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.deleteTargetId = null;
  }

  deleteProduct() {
    if (!this.deleteTargetId) return;
    this.productService.delete(this.deleteTargetId).subscribe(() => {
      this.products = this.products.filter(p => p.id !== this.deleteTargetId);
      this.allProducts = this.allProducts.filter(p => p.id !== this.deleteTargetId);
      this.showDeleteModal = false;
      this.deleteTargetId = null;
      this.cdr.detectChanges();
      this.showToastMessage('Product deleted successfully!', 'success');
    });
  }

  showToastMessage(message: string, type: string) {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  getTotalValue(): number {
    return this.allProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  }

  getCategories(): number {
    return new Set(this.allProducts.map(p => p.category)).size;
  }
  getStockStatus(product: Product): string {
  if (product.quantity === 0) return 'out';
  if (product.quantity <= product.lowStockThreshold) return 'low';
  return 'ok';
}

getLowStockProducts(): Product[] {
  return this.allProducts.filter(p => p.quantity <= p.lowStockThreshold);
}
getLowStockCount(): number {
  return this.allProducts.filter(p => 
    p.quantity <= p.lowStockThreshold
  ).length;
}
sortProducts(column: keyof Product): void {

  if (this.sortColumn === column) {
    this.sortDirection =
      this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  this.products.sort((a, b) => {

    const valueA = a[column];
    const valueB = b[column];

    if (typeof valueA === 'string' &&
        typeof valueB === 'string') {

      return this.sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return this.sortDirection === 'asc'
      ? Number(valueA) - Number(valueB)
      : Number(valueB) - Number(valueA);
  });
}
}