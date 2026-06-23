using Microsoft.AspNetCore.Mvc;
using InventoryApi.Data;
using InventoryApi.Models;

namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CategoriesController(AppDbContext db) => _db = db;

        [HttpGet]
        public IActionResult GetAll() => Ok(_db.Categories.ToList());

        [HttpGet("{id}")]
        public IActionResult GetOne(int id)
        {
            var cat = _db.Categories.Find(id);
            return cat == null ? NotFound() : Ok(cat);
        }

        [HttpPost]
        public IActionResult Create(Category category)
        {
            _db.Categories.Add(category);
            _db.SaveChanges();
            return CreatedAtAction(nameof(GetOne), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Category updated)
        {
            var cat = _db.Categories.Find(id);
            if (cat == null) return NotFound();
            cat.Name = updated.Name;
            cat.Description = updated.Description;
            _db.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var cat = _db.Categories.Find(id);
            if (cat == null) return NotFound();
            _db.Categories.Remove(cat);
            _db.SaveChanges();
            return NoContent();
        }
    }
}