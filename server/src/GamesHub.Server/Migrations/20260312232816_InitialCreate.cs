using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GamesHub.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Games",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Games", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Levels",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    GameId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Difficulty = table.Column<int>(type: "INTEGER", nullable: false),
                    SchemaVersion = table.Column<int>(type: "INTEGER", nullable: false),
                    MoveLen = table.Column<int>(type: "INTEGER", nullable: false),
                    Nodes = table.Column<string>(type: "TEXT", nullable: false),
                    Edges = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Levels", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Games",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[] { "minzzle-fives", "Cover every edge of the graph using moves of exactly 5 edges.", "Minzzle Fives" });

            migrationBuilder.InsertData(
                table: "Levels",
                columns: new[] { "Id", "Difficulty", "Edges", "GameId", "MoveLen", "Name", "Nodes", "SchemaVersion" },
                values: new object[,]
                {
                    { "level-001", 1, "[{\"id\":0,\"a\":0,\"b\":1},{\"id\":1,\"a\":1,\"b\":2},{\"id\":2,\"a\":2,\"b\":3},{\"id\":3,\"a\":4,\"b\":5},{\"id\":4,\"a\":5,\"b\":6},{\"id\":5,\"a\":6,\"b\":7},{\"id\":6,\"a\":0,\"b\":4},{\"id\":7,\"a\":1,\"b\":5},{\"id\":8,\"a\":2,\"b\":6},{\"id\":9,\"a\":3,\"b\":7}]", "minzzle-fives", 5, "First Steps", "[{\"id\":0,\"x\":0,\"y\":0},{\"id\":1,\"x\":1,\"y\":0},{\"id\":2,\"x\":2,\"y\":0},{\"id\":3,\"x\":3,\"y\":0},{\"id\":4,\"x\":0,\"y\":1},{\"id\":5,\"x\":1,\"y\":1},{\"id\":6,\"x\":2,\"y\":1},{\"id\":7,\"x\":3,\"y\":1}]", 1 },
                    { "level-002", 2, "[{\"id\":0,\"a\":0,\"b\":1},{\"id\":1,\"a\":1,\"b\":2},{\"id\":2,\"a\":3,\"b\":4},{\"id\":3,\"a\":4,\"b\":5},{\"id\":4,\"a\":6,\"b\":7},{\"id\":5,\"a\":7,\"b\":8},{\"id\":6,\"a\":0,\"b\":3},{\"id\":7,\"a\":1,\"b\":4},{\"id\":8,\"a\":2,\"b\":5},{\"id\":9,\"a\":3,\"b\":6},{\"id\":10,\"a\":4,\"b\":7},{\"id\":11,\"a\":5,\"b\":8},{\"id\":12,\"a\":0,\"b\":4},{\"id\":13,\"a\":1,\"b\":5},{\"id\":14,\"a\":3,\"b\":7},{\"id\":15,\"a\":4,\"b\":8},{\"id\":16,\"a\":1,\"b\":3},{\"id\":17,\"a\":2,\"b\":4},{\"id\":18,\"a\":4,\"b\":6},{\"id\":19,\"a\":5,\"b\":7}]", "minzzle-fives", 5, "Crossroads", "[{\"id\":0,\"x\":0,\"y\":0},{\"id\":1,\"x\":1,\"y\":0},{\"id\":2,\"x\":2,\"y\":0},{\"id\":3,\"x\":0,\"y\":1},{\"id\":4,\"x\":1,\"y\":1},{\"id\":5,\"x\":2,\"y\":1},{\"id\":6,\"x\":0,\"y\":2},{\"id\":7,\"x\":1,\"y\":2},{\"id\":8,\"x\":2,\"y\":2}]", 1 },
                    { "level-003", 3, "[{\"id\":0,\"a\":0,\"b\":1},{\"id\":1,\"a\":1,\"b\":2},{\"id\":2,\"a\":2,\"b\":3},{\"id\":3,\"a\":3,\"b\":4},{\"id\":4,\"a\":5,\"b\":6},{\"id\":5,\"a\":6,\"b\":7},{\"id\":6,\"a\":7,\"b\":8},{\"id\":7,\"a\":8,\"b\":9},{\"id\":8,\"a\":10,\"b\":11},{\"id\":9,\"a\":11,\"b\":12},{\"id\":10,\"a\":12,\"b\":13},{\"id\":11,\"a\":13,\"b\":14},{\"id\":12,\"a\":0,\"b\":5},{\"id\":13,\"a\":1,\"b\":6},{\"id\":14,\"a\":2,\"b\":7},{\"id\":15,\"a\":3,\"b\":8},{\"id\":16,\"a\":4,\"b\":9},{\"id\":17,\"a\":5,\"b\":10},{\"id\":18,\"a\":6,\"b\":11},{\"id\":19,\"a\":7,\"b\":12},{\"id\":20,\"a\":8,\"b\":13},{\"id\":21,\"a\":9,\"b\":14},{\"id\":22,\"a\":0,\"b\":6},{\"id\":23,\"a\":2,\"b\":8},{\"id\":24,\"a\":7,\"b\":11}]", "minzzle-fives", 5, "Wide Grid", "[{\"id\":0,\"x\":0,\"y\":0},{\"id\":1,\"x\":1,\"y\":0},{\"id\":2,\"x\":2,\"y\":0},{\"id\":3,\"x\":3,\"y\":0},{\"id\":4,\"x\":4,\"y\":0},{\"id\":5,\"x\":0,\"y\":1},{\"id\":6,\"x\":1,\"y\":1},{\"id\":7,\"x\":2,\"y\":1},{\"id\":8,\"x\":3,\"y\":1},{\"id\":9,\"x\":4,\"y\":1},{\"id\":10,\"x\":0,\"y\":2},{\"id\":11,\"x\":1,\"y\":2},{\"id\":12,\"x\":2,\"y\":2},{\"id\":13,\"x\":3,\"y\":2},{\"id\":14,\"x\":4,\"y\":2}]", 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Levels_GameId",
                table: "Levels",
                column: "GameId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Games");

            migrationBuilder.DropTable(
                name: "Levels");
        }
    }
}
