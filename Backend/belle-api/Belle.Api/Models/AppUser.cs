namespace Belle.Api.Models
{
    public class AppUser
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; } = true;
        public string? PhotoUrl { get; set; }
        public string? UserType { get; set; }
    }
}
