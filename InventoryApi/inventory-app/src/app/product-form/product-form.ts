import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.html',
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  productId!: number;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      category: ['', Validators.required],
      quantity: [0, Validators.required],
      price:    [0, Validators.required],
      lowStockThreshold:  [5]
    });

    // Check if edit mode
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.isEditMode = true;
      this.productService.getOne(this.productId).subscribe(product => {
        this.form.patchValue(product);
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.isEditMode) {
      this.productService.update(this.productId, this.form.value).subscribe(() => {
        this.router.navigate(['/products']);
      });
    } else {
      this.productService.create(this.form.value).subscribe(() => {
        this.router.navigate(['/products']);
      });
    }
  }
}