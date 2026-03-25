using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GamesHub.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddBoardJsonAndNewGames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Board",
                table: "Levels",
                type: "TEXT",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Games",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { "minzzle-swipes", "Slide rows and columns to restore the color grid.", "Minzzle Swipes" },
                    { "minzzle-swipes-hex", "Slide hexagonal lines to restore the color pattern.", "Minzzle Swipes Hex" }
                });

            migrationBuilder.UpdateData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "level-001",
                column: "Board",
                value: null);

            migrationBuilder.UpdateData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "level-002",
                column: "Board",
                value: null);

            migrationBuilder.UpdateData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "level-003",
                column: "Board",
                value: null);

            migrationBuilder.InsertData(
                table: "Levels",
                columns: new[] { "Id", "Board", "Difficulty", "Edges", "GameId", "MoveLen", "Name", "Nodes", "SchemaVersion", "Solution" },
                values: new object[,]
                {
                    { "hex-001", "{\"side\":2,\"colors\":[\"#3b82f6\",\"#eab308\",\"#22c55e\",\"#ef4444\",\"#a855f7\",\"#f97316\"],\"scrambleMoves\":[{\"axis\":\"horizontal\",\"lineIndex\":1},{\"axis\":\"diagL\",\"lineIndex\":2},{\"axis\":\"diagR\",\"lineIndex\":0}]}", 1, "[]", "minzzle-swipes-hex", 3, "Hex Intro", "[]", 1, null },
                    { "hex-002", "{\"side\":3,\"colors\":[\"#3b82f6\",\"#eab308\",\"#22c55e\",\"#ef4444\",\"#a855f7\",\"#f97316\"],\"scrambleMoves\":[{\"axis\":\"horizontal\",\"lineIndex\":2},{\"axis\":\"diagR\",\"lineIndex\":3},{\"axis\":\"diagL\",\"lineIndex\":1},{\"axis\":\"horizontal\",\"lineIndex\":4},{\"axis\":\"diagR\",\"lineIndex\":1}]}", 2, "[]", "minzzle-swipes-hex", 5, "Hex Medium", "[]", 1, null },
                    { "hex-003", "{\"side\":3,\"colors\":[\"#3b82f6\",\"#eab308\",\"#22c55e\",\"#ef4444\",\"#a855f7\",\"#f97316\"],\"scrambleMoves\":[{\"axis\":\"horizontal\",\"lineIndex\":0},{\"axis\":\"diagL\",\"lineIndex\":3},{\"axis\":\"diagR\",\"lineIndex\":2},{\"axis\":\"horizontal\",\"lineIndex\":3},{\"axis\":\"diagL\",\"lineIndex\":0},{\"axis\":\"diagR\",\"lineIndex\":4},{\"axis\":\"horizontal\",\"lineIndex\":1},{\"axis\":\"diagL\",\"lineIndex\":2}]}", 3, "[]", "minzzle-swipes-hex", 8, "Hex Challenge", "[]", 1, null },
                    { "swipes-001", "{\"rows\":4,\"cols\":4,\"solved\":[[\"#3b82f6\",\"#3b82f6\",\"#eab308\",\"#eab308\"],[\"#3b82f6\",\"#3b82f6\",\"#eab308\",\"#eab308\"],[\"#ef4444\",\"#ef4444\",\"#22c55e\",\"#22c55e\"],[\"#ef4444\",\"#ef4444\",\"#22c55e\",\"#22c55e\"]],\"scrambleMoves\":[{\"type\":\"row\",\"index\":1},{\"type\":\"col\",\"index\":2}]}", 1, "[]", "minzzle-swipes", 2, "Tiny Quadrants", "[]", 1, null },
                    { "swipes-002", "{\"rows\":6,\"cols\":6,\"solved\":[[\"#3b82f6\",\"#3b82f6\",\"#3b82f6\",\"#eab308\",\"#eab308\",\"#eab308\"],[\"#3b82f6\",\"#3b82f6\",\"#3b82f6\",\"#eab308\",\"#eab308\",\"#eab308\"],[\"#3b82f6\",\"#3b82f6\",\"#3b82f6\",\"#eab308\",\"#eab308\",\"#eab308\"],[\"#ef4444\",\"#ef4444\",\"#ef4444\",\"#22c55e\",\"#22c55e\",\"#22c55e\"],[\"#ef4444\",\"#ef4444\",\"#ef4444\",\"#22c55e\",\"#22c55e\",\"#22c55e\"],[\"#ef4444\",\"#ef4444\",\"#ef4444\",\"#22c55e\",\"#22c55e\",\"#22c55e\"]],\"scrambleMoves\":[{\"type\":\"row\",\"index\":1},{\"type\":\"col\",\"index\":4},{\"type\":\"row\",\"index\":3},{\"type\":\"col\",\"index\":0},{\"type\":\"row\",\"index\":5}]}", 2, "[]", "minzzle-swipes", 5, "Classic Quadrants", "[]", 1, null },
                    { "swipes-003", "{\"rows\":6,\"cols\":6,\"solved\":[[\"#3b82f6\",\"#3b82f6\",\"#3b82f6\",\"#eab308\",\"#eab308\",\"#eab308\"],[\"#3b82f6\",\"#3b82f6\",\"#3b82f6\",\"#eab308\",\"#eab308\",\"#eab308\"],[\"#3b82f6\",\"#3b82f6\",\"#3b82f6\",\"#eab308\",\"#eab308\",\"#eab308\"],[\"#ef4444\",\"#ef4444\",\"#ef4444\",\"#22c55e\",\"#22c55e\",\"#22c55e\"],[\"#ef4444\",\"#ef4444\",\"#ef4444\",\"#22c55e\",\"#22c55e\",\"#22c55e\"],[\"#ef4444\",\"#ef4444\",\"#ef4444\",\"#22c55e\",\"#22c55e\",\"#22c55e\"]],\"scrambleMoves\":[{\"type\":\"row\",\"index\":0},{\"type\":\"col\",\"index\":2},{\"type\":\"row\",\"index\":4},{\"type\":\"col\",\"index\":5},{\"type\":\"row\",\"index\":2},{\"type\":\"col\",\"index\":1},{\"type\":\"row\",\"index\":3},{\"type\":\"col\",\"index\":3}]}", 3, "[]", "minzzle-swipes", 8, "Tangled Quadrants", "[]", 1, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Games",
                keyColumn: "Id",
                keyValue: "minzzle-swipes");

            migrationBuilder.DeleteData(
                table: "Games",
                keyColumn: "Id",
                keyValue: "minzzle-swipes-hex");

            migrationBuilder.DeleteData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "hex-001");

            migrationBuilder.DeleteData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "hex-002");

            migrationBuilder.DeleteData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "hex-003");

            migrationBuilder.DeleteData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "swipes-001");

            migrationBuilder.DeleteData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "swipes-002");

            migrationBuilder.DeleteData(
                table: "Levels",
                keyColumn: "Id",
                keyValue: "swipes-003");

            migrationBuilder.DropColumn(
                name: "Board",
                table: "Levels");
        }
    }
}
