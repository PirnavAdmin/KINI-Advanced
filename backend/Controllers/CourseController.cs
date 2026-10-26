using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentSphereAPI.Authorization;
using TalentSphereAPI.DTOs.Course;
using TalentSphereAPI.Services;

namespace TalentSphereAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/v1/courses")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _service;

        public CoursesController(ICourseService service)
        {
            _service = service;
        }

        // =====================================================
        // GET ALL COURSES
        // Courses -> View
        // =====================================================

        [HttpGet]
        [HasPermission("Courses", "view")]
        public async Task<IActionResult> GetAll(
            string? search,
            bool? status,
            int? mentorId,
            int? batchId,
            string? level,
            string? sortBy = "CourseName",
            string? sortOrder = "asc",
            int page = 1,
            int pageSize = 10)
        {
            var result =
                await _service.GetAllAsync(
                    search,
                    status,
                    mentorId,
                    batchId,
                    level,
                    sortBy,
                    sortOrder,
                    page,
                    pageSize);

            return Ok(result);
        }

        // =====================================================
        // GET COURSE BY ID
        // Courses -> View
        // =====================================================

        [HttpGet("{id:int}")]
        [HasPermission("Courses", "view")]
        public async Task<IActionResult> GetById(int id)
        {
            var course =
                await _service.GetByIdAsync(id);

            if (course == null)
            {
                return NotFound(new
                {
                    Message = "Course not found."
                });
            }

            return Ok(course);
        }

        // =====================================================
        // CREATE COURSE
        // Courses -> Add
        // =====================================================

        [HttpPost]
        [HasPermission("Courses", "add")]
        public async Task<IActionResult> Create(
            [FromBody] CreateCourseDto dto)
        {
            try
            {
                var course =
                    await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        id = course.CourseId
                    },
                    course);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // UPDATE COURSE
        // Courses -> Edit
        // =====================================================

        [HttpPut("{id:int}")]
        [HasPermission("Courses", "edit")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateCourseDto dto)
        {
            try
            {
                var updated =
                    await _service.UpdateAsync(
                        id,
                        dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        Message = "Course not found."
                    });
                }

                return Ok(new
                {
                    Message =
                        "Course updated successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
        }

        // =====================================================
        // DELETE COURSE
        // Courses -> Delete
        // =====================================================

        [HttpDelete("{id:int}")]
        [HasPermission("Courses", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Course not found."
                });
            }

            return Ok(new
            {
                Message =
                    "Course deleted successfully."
            });
        }

        // =====================================================
        // UPLOAD COURSE PDF
        // Courses -> Edit
        // =====================================================

        [HttpPost("{id:int}/upload-pdf")]
        [HasPermission("Courses", "edit")]
        public async Task<IActionResult> UploadPdf(
            int id,
            IFormFile file)
        {
            if (file == null ||
                file.Length == 0)
            {
                return BadRequest(new
                {
                    Message =
                        "Please upload a PDF."
                });
            }

            if (!string.Equals(
                    Path.GetExtension(file.FileName),
                    ".pdf",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    Message =
                        "Only PDF files are allowed."
                });
            }

            var pdf =
                await _service.UploadPdfAsync(
                    id,
                    file);

            if (pdf == null)
            {
                return NotFound(new
                {
                    Message =
                        "Course not found."
                });
            }

            return Ok(new
            {
                Message =
                    "PDF uploaded successfully.",

                PdfUrl = pdf
            });
        }
        // =====================================================
        // OPEN / DOWNLOAD COURSE PDF
        // Courses -> View
        // =====================================================

        [HttpGet("{id:int}/pdf")]
        [HasPermission("Courses", "view")]
        public async Task<IActionResult> GetPdf(int id)
        {
            var pdf =
                await _service.GetPdfAsync(id);

            if (pdf == null)
            {
                return NotFound(new
                {
                    Message =
                        "Course PDF not found."
                });
            }

            return PhysicalFile(
                pdf.Value.FilePath,
                "application/pdf",
                enableRangeProcessing: true);
        }
    }
}