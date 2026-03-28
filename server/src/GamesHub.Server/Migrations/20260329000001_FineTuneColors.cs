using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamesHub.Server.Migrations
{
    /// <inheritdoc />
    public partial class FineTuneColors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fine-tune Rubik's colors to match reference palette more closely
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""BoardJson"" = replace(replace(replace(""BoardJson"",
  '#0046AD', '#1255C8'),
  '#B71234', '#C8102E'),
  '#009B48', '#00873A')
WHERE ""GameId"" IN ('minzzle-swipes', 'minzzle-swipes-hex');
");

            // Also update hex-specific colors if needed
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""BoardJson"" = replace(""BoardJson"",
  '#0046AD', '#1255C8')
WHERE ""GameId"" = 'minzzle-swipes-hex';
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
UPDATE ""Levels""
SET ""BoardJson"" = replace(replace(replace(""BoardJson"",
  '#1255C8', '#0046AD'),
  '#C8102E', '#B71234'),
  '#00873A', '#009B48')
WHERE ""GameId"" IN ('minzzle-swipes', 'minzzle-swipes-hex');
");
        }
    }
}
