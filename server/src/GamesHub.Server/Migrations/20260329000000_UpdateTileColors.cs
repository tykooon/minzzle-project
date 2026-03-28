using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamesHub.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTileColors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Replace Tailwind-based colors with classic Rubik's Cube colors
            // Shared: blue, yellow, red, green (used in both Swipes and Hex)
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""BoardJson"" = replace(replace(replace(replace(""BoardJson"",
  '#3b82f6', '#1255C8'),
  '#eab308', '#FFD500'),
  '#ef4444', '#C8102E'),
  '#22c55e', '#00873A')
WHERE ""GameId"" IN ('minzzle-swipes', 'minzzle-swipes-hex');
");

            // Hex-only: replace purple→orange, orange→white (6th Rubik's face)
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""BoardJson"" = replace(replace(""BoardJson"",
  '#a855f7', '#FF5800'),
  '#f97316', '#FFFFFF')
WHERE ""GameId"" = 'minzzle-swipes-hex';
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse: restore original Tailwind colors
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""BoardJson"" = replace(replace(replace(replace(""BoardJson"",
  '#1255C8', '#3b82f6'),
  '#FFD500', '#eab308'),
  '#C8102E', '#ef4444'),
  '#00873A', '#22c55e')
WHERE ""GameId"" IN ('minzzle-swipes', 'minzzle-swipes-hex');
");

            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""BoardJson"" = replace(replace(""BoardJson"",
  '#FF5800', '#a855f7'),
  '#FFFFFF', '#f97316')
WHERE ""GameId"" = 'minzzle-swipes-hex';
");
        }
    }
}
