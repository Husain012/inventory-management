import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule,DecimalPipe  } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables,ChartOptions } from 'chart.js';
import { ProductService } from '../services/product';
import { Product } from '../models/product';
import AOS from 'aos';

Chart.register(...registerables);

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, RouterModule,DecimalPipe],
//   templateUrl: './dashboard.html',
// })
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  totalProducts = 0;
  totalValue = 0;
  totalCategories = 0;
  lowStockCount = 0;
  lowStockProducts: Product[] = [];
  recentProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.calculateStats();
        this.cdr.detectChanges();
        setTimeout(() => this.buildCharts(), 100);
        
      },
      error: (err) => console.error(err)
    });
  }

  calculateStats() {
  this.totalProducts = this.products.length;
  this.totalValue = this.products.reduce((s, p) => s + p.price * p.quantity, 0);
  this.totalCategories = new Set(this.products.map(p => p.category)).size;
  this.lowStockProducts = this.products.filter(p => p.quantity <= p.lowStockThreshold);
  this.lowStockCount = this.lowStockProducts.length;
  this.recentProducts = [...this.products].slice(-5).reverse();
  }

buildCharts() {
  Chart.getChart('barChart')?.destroy();
  Chart.getChart('pieChart')?.destroy();
  Chart.getChart('valueChart')?.destroy();

  // Products per Category
  const categoryMap = new Map<string, number>();

  this.products.forEach(p => {
    categoryMap.set(
      p.category,
      (categoryMap.get(p.category) || 0) + 1
    );
  });

  new Chart('barChart', {
    type: 'bar',
    data: {
      labels: [...categoryMap.keys()],
      datasets: [{
        label: 'Products',
        data: [...categoryMap.values()],
        backgroundColor: [
          '#3B82F6',
          '#8B5CF6',
          '#10B981',
          '#F59E0B',
          '#EF4444'
        ],
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,

      animations: {
      y: {
        duration: 2500,
        easing: 'easeOutBounce'
      }
    },

      plugins: {
        legend: {
          display: false
        }
      },

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });

  // Stock Status Doughnut Chart
  const inStock = this.products.filter(
    p => p.quantity > p.lowStockThreshold
  ).length;

  const lowStock = this.products.filter(
    p => p.quantity > 0 &&
    p.quantity <= p.lowStockThreshold
  ).length;

  const outOfStock = this.products.filter(
    p => p.quantity === 0
  ).length;

  new Chart('pieChart', {
    type: 'doughnut',
    data: {
      labels: [
        'In Stock',
        'Low Stock',
        'Out Of Stock'
      ],
      datasets: [{
        data: [
          inStock,
          lowStock,
          outOfStock
        ],
        backgroundColor: [
          '#22C55E',
          '#F59E0B',
          '#EF4444'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,

      animation: {
        duration: 2500,
        easing: 'easeOutQuart'
      },

      cutout: '70%',

      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
  

  // Top 5 Products by Value
  const top5 = [...this.products]
    .sort(
      (a, b) =>
        (b.price * b.quantity) -
        (a.price * a.quantity)
    )
    .slice(0, 5);

  new Chart('valueChart', {
    type: 'bar',
    data: {
      labels: top5.map(p => p.name),
      datasets: [{
        label: 'Value (₹)',
        data: top5.map(
          p => p.price * p.quantity
        ),
        backgroundColor: '#10B981',
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,

      animation: {
        duration: 2500,
        easing: 'easeOutQuart'
      },

      plugins: {
        legend: {
          display: false
        }
      },

      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
}