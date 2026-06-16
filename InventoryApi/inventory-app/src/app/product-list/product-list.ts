import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
  Math = Math;

  // Toast
  toastMessage = '';
  toastType = '';
  showToast = false;

  // Sort
  sortColumn: keyof Product | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Delete modal
  showDeleteModal = false;
  deleteTargetId: number | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  pagedProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['toast'] === 'created') {
        this.showToastMessage('Product added successfully! 🎉', 'success');
      }
      if (params['toast'] === 'updated') {
        this.showToastMessage('Product updated successfully! ✏️', 'success');
      }
    });

    this.productService.getAll().subscribe({
      next: (data) => {
        this.allProducts = [...data];
        this.products = [...data];
        this.setupPagination();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  // ── Pagination ──────────────────────────────
  setupPagination() {
    this.totalPages = Math.ceil(this.products.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.updatePagedProducts();
  }

  updatePagedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedProducts = this.products.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedProducts();
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ── Search ───────────────────────────────────
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.products = this.allProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
    if (this.sortColumn) this.sortProducts(this.sortColumn);
    this.currentPage = 1;
    this.setupPagination();
  }

  // ── Sort ─────────────────────────────────────
  sortProducts(column: keyof Product): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.products.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return this.sortDirection === 'asc'
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    });
    this.currentPage = 1;
    this.setupPagination();
  }

  // ── Delete ───────────────────────────────────
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
      this.setupPagination();
      this.showToastMessage('Product deleted successfully!', 'success');
    });
  }

  // ── Toast ────────────────────────────────────
  showToastMessage(message: string, type: string) {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  // ── Stats ────────────────────────────────────
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
    return this.allProducts.filter(p => p.quantity <= p.lowStockThreshold).length;
  }
}