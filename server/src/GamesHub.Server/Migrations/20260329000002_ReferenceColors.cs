using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamesHub.Server.Migrations
{
    /// <inheritdoc />
    public partial class ReferenceColors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update to final reference CSS palette
            // Covers all intermediate values from previous migration attempts
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""Board"" = replace(replace(replace(replace(replace(replace(""Board"",
  '#C8102E', '#D92B2F'),
  '#B71234', '#D92B2F'),
  '#1255C8', '#2D63D9'),
  '#0046AD', '#2D63D9'),
  '#FFD500', '#D9B300'),
  '#00873A', '#27A84A')
WHERE ""GameId"" IN ('minzzle-swipes', 'minzzle-swipes-hex');
");

            // Hex-only: orange and white
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""Board"" = replace(replace(""Board"",
  '#FF5800', '#F08A12'),
  '#FFFFFF', '#E9EDF5')
WHERE ""GameId"" = 'minzzle-swipes-hex';
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""Board"" = replace(replace(replace(replace(""Board"",
  '#D92B2F', '#C8102E'),
  '#2D63D9', '#1255C8'),
  '#D9B300', '#FFD500'),
  '#27A84A', '#00873A')
WHERE ""GameId"" IN ('minzzle-swipes', 'minzzle-swipes-hex');
");

            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""Board"" = replace(replace(""Board"",
  '#F08A12', '#FF5800'),
  '#E9EDF5', '#FFFFFF')
WHERE ""GameId"" = 'minzzle-swipes-hex';
");
        }
    }
}
