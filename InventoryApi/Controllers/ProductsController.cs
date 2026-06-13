using InventoryApi.Data;
using InventoryApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ProductsController(AppDbContext db) => _db = db;

        [HttpGet]
        public IActionResult GetAll() => Ok(_db.Products.ToList());

        [HttpGet("{id}")]
        public IActionResult GetOne(int id)
        {
            var product = _db.Products.Find(id);
            return product == null ? NotFound() : Ok(product);
        }

        [HttpPost]
        public IActionResult Create(Product product)
        {
            _db.Products.Add(product);
            _db.SaveChanges();
            return CreatedAtAction(nameof(GetOne), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Product updated)
        {
            var product = _db.Products.Find(id);
            if (product == null) return NotFound();
            product.Name = updated.Name;
            product.Category = updated.Category;
            product.Quantity = updated.Quantity;
            product.Price = updated.Price;
            _db.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var product = _db.Products.Find(id);
            if (product == null) return NotFound();
            _db.Products.Remove(product);
            _db.SaveChanges();
            return NoContent();
        }
    }
}
