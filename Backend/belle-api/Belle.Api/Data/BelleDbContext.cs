using Belle.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Belle.Api.Data
{
    public class BelleDbContext : DbContext
    {
        public BelleDbContext(DbContextOptions<BelleDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Clase> Clases => Set<Clase>();
        public DbSet<Reserva> Reservas => Set<Reserva>();
        public DbSet<EngagementScore> EngagementScores => Set<EngagementScore>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Correo)
                .IsUnique();

            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Usuario)
                .WithMany(u => u.Reservas)
                .HasForeignKey(r => r.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Clase)
                .WithMany(c => c.Reservas)
                .HasForeignKey(r => r.ClaseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EngagementScore>()
                .HasOne(e => e.Usuario)
                .WithOne(u => u.Engagement)
                .HasForeignKey<EngagementScore>(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }
    }
}