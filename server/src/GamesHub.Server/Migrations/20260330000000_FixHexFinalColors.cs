using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamesHub.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixHexFinalColors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Brute-force replace all known intermediate/original purple values → orange
            // and all known intermediate/original orange values → white
            // Covers any gap in the prior migration chain
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""Board"" = replace(replace(replace(replace(replace(replace(""Board"",
  '#a855f7', '#F08A12'),
  '#A855F7', '#F08A12'),
  '#f97316', '#E9EDF5'),
  '#F97316', '#E9EDF5'),
  '#FF5800', '#F08A12'),
  '#FFFFFF', '#E9EDF5')
WHERE ""GameId"" = 'minzzle-swipes-hex';
");

            // Also cover shared color stragglers
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""Board"" = replace(replace(replace(replace(""Board"",
  '#3b82f6', '#2D63D9'),
  '#eab308', '#D9B300'),
  '#ef4444', '#D92B2F'),
  '#22c55e', '#27A84A')
WHERE ""GameId"" IN ('minzzle-swipes', 'minzzle-swipes-hex');
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No meaningful rollback — this is a catch-all fix migration
        }
    }
}
