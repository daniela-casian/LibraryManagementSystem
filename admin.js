
const API_URL = "http://localhost:3000/books";

const addBookForm = document.getElementById("addBookForm");
const formMessage = document.getElementById("formMessage");

addBookForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const book = {
        title: document.getElementById("bookTitle").value.trim(),
        author: document.getElementById("bookAuthor").value.trim(),
        description: document.getElementById("bookDescription").value.trim(),
        categoryId: Number(
            document.getElementById("bookCategory").value
        ),
        publicationYear: Number(
            document.getElementById("bookYear").value
        ),
        isbn: document.getElementById("bookIsbn").value.trim()
    };

    formMessage.textContent = "Se salvează cartea...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(book)
        });

        const result = await response.json();

        if (!response.ok) {
            const message = Array.isArray(result.message)
                ? result.message.join(", ")
                : result.message;

            throw new Error(
                message || "Nu s-a putut adăuga cartea."
            );
        }

        formMessage.textContent =
            "Cartea a fost adăugată cu succes!";

        addBookForm.reset();

    } catch (error) {
        console.error("Eroare la adăugarea cărții:", error);

        formMessage.textContent =
            "Eroare: " + error.message;
    }
});
