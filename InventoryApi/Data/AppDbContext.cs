using Microsoft.EntityFrameworkCore;
using InventoryApi.Models;

namespace InventoryApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    //public DbSet<Product> Products => Set<Product>();
    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
}