using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GamesHub.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddLevelSolutionJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Solution",
                table: "Levels",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "level-001",
                column: "Solution",
                value: null);

            migrationBuilder.UpdateData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "level-002",
                column: "Solution",
                value: null);

            migrationBuilder.UpdateData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "level-003",
                column: "Solution",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Solution",
                table: "Levels");
        }
    }
}
