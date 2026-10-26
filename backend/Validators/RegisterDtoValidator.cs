using FluentValidation;
using TalentSphereAPI.DTOs;

namespace TalentSphereAPI.Validators.Auth
{
    public class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator()
        {
            // ===========================
            // First Name
            // ===========================
            RuleFor(x => x.FirstName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("First name is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("First name cannot contain only whitespace.")
                .Length(2, 50)
                .WithMessage("First name must be between 2 and 50 characters.")
                .Matches(@"^[A-Za-z\s'-]+$")
                .WithMessage("First name can contain only letters, spaces, apostrophes and hyphens.");

            // ===========================
            // Last Name
            // ===========================
            RuleFor(x => x.LastName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Last name is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Last name cannot contain only whitespace.")
                .Length(2, 50)
                .WithMessage("Last name must be between 2 and 50 characters.")
                .Matches(@"^[A-Za-z\s'-]+$")
                .WithMessage("Last name can contain only letters, spaces, apostrophes and hyphens.");

            // ===========================
            // Email (Optional)
            // ===========================
            When(x => !string.IsNullOrWhiteSpace(x.Email), () =>
            {
                RuleFor(x => x.Email)
                    .MaximumLength(100)
                    .WithMessage("Email cannot exceed 100 characters.")
                    .EmailAddress()
                    .WithMessage("Please enter a valid email address.");
            });

            // ===========================
            // Phone (Optional)
            // ===========================
            When(x => !string.IsNullOrWhiteSpace(x.Phone), () =>
            {
                RuleFor(x => x.Phone)
                    .Matches(@"^[6-9]\d{9}$")
                    .WithMessage("Phone number must be a valid 10-digit Indian mobile number.");
            });

            // ===========================
            // Identifier Validation
            // ===========================
            RuleFor(x => x)
                .Must(x =>
                    !string.IsNullOrWhiteSpace(x.Email) ||
                    !string.IsNullOrWhiteSpace(x.Phone))
                .WithMessage("Either Email or Phone is required.");

            // ===========================
            // Password
            // ===========================
            RuleFor(x => x.Password)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8)
                .WithMessage("Password must be at least 8 characters long.")
                .MaximumLength(128)
                .WithMessage("Password cannot exceed 128 characters.")
                .Matches("[A-Z]")
                .WithMessage("Password must contain at least one uppercase letter.")
                .Matches("[a-z]")
                .WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"\d")
                .WithMessage("Password must contain at least one number.")
                .Matches(@"[!@#$%^&*()_\-+=\[{\]};:'"",.<>/?\\|`~]")
                .WithMessage("Password must contain at least one special character.")
                .Must(password => password.Trim() == password)
                .WithMessage("Password cannot start or end with spaces.")
                .Must(password => !password.Contains(" "))
                .WithMessage("Password cannot contain spaces.");

            // ===========================
            // Confirm Password
            // ===========================
            RuleFor(x => x.ConfirmPassword)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Confirm Password is required.")
                .Equal(x => x.Password)
                .WithMessage("Password and Confirm Password do not match.");

            // ===========================
            // Role
            // ===========================
            RuleFor(x => x.Role)
                .IsInEnum()
                .WithMessage("Please select a valid role.");
        }
    }
}