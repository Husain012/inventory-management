import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../services/category';
import { ProductService } from '../services/product';
import { Category } from '../models/category';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './categories.html',
})
export class CategoriesComponent implements OnInit {

  categories: Category[] = [];
  productCountMap = new Map<string, number>();

  form!: FormGroup;
  showForm = false;
  isEditMode = false;
  editId: number | null = null;

  showDeleteModal = false;
  deleteTargetId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef  // ← ADDED
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.loadData();
  }

  loadData() {
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories = [...res];  // ← spread forces new array reference
        this.cdr.detectChanges();    // ← force UI update
      },
      error: (err) => console.error('❌ Error:', err)
    });

    this.productService.getAll().subscribe({
      next: (products) => {
        this.productCountMap.clear();
        products.forEach(p => {
          const count = this.productCountMap.get(p.category) || 0;
          this.productCountMap.set(p.category, count + 1);
        });
        this.cdr.detectChanges();  // ← force UI update
      },
      error: (err) => console.error('❌ Product error:', err)
    });
  }

  getProductCount(name: string) {
    return this.productCountMap.get(name) || 0;
  }

  openAddForm() {
    this.isEditMode = false;
    this.editId = null;
    this.form.reset();
    this.showForm = true;
  }

  openEditForm(cat: Category) {
    this.isEditMode = true;
    this.editId = cat.id!;
    this.form.patchValue(cat);
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.isEditMode && this.editId) {
      this.categoryService.update(this.editId, this.form.value)
        .subscribe(() => {
          this.loadData();
          this.closeForm();
        });
    } else {
      this.categoryService.create(this.form.value)
        .subscribe(() => {
          this.loadData();
          this.closeForm();
        });
    }
  }

  confirmDelete(id: number) {
    this.deleteTargetId = id;
    this.showDeleteModal = true;
  }

  deleteCategory() {
    if (!this.deleteTargetId) return;

    this.categoryService.delete(this.deleteTargetId).subscribe(() => {
      this.categories = this.categories.filter(c => c.id !== this.deleteTargetId);
      this.showDeleteModal = false;
      this.deleteTargetId = null;
      this.cdr.detectChanges();  // ← force UI update
    });
  }
}