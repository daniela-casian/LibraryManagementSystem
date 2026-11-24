
const API_URL = "http://localhost:3000/books";

// Cărțile vor fi încărcate din backend
let books = [];

// Exemplarele sunt momentan date locale de test
let exemplars = [
    {
        id: 1,
        book_id: 1,
        status: "available"
    },
    {
        id: 2,
        book_id: 1,
        status: "borrowed"
    },
    {
        id: 3,
        book_id: 1,
        status: "damaged"
    },
    {
        id: 4,
        book_id: 2,
        status: "available"
    },
    {
        id: 5,
        book_id: 3,
        status: "borrowed"
    }
];

// Elementele din pagina HTML
const booksContainer = document.getElementById("books");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

// Căutăm o carte după ID
function findBookById(id) {
    return books.find(function(book) {
        return book.id === id;
    });
}

// Obținem cărțile disponibile
function getAvailableBooks() {
    return books.filter(function(book) {
        return exemplars.some(function(exemplar) {
            return exemplar.book_id === book.id &&
                   exemplar.status === "available";
        });
    });
}

// Adăugăm o carte în lista locală
function addBook(book) {
    books.push(book);
    displayBooks(books);
}

// Modificăm titlul unei cărți în lista locală
function updateBook(id, newTitle) {
    let book = findBookById(id);

    if (book) {
        book.title = newTitle;
        displayBooks(books);
    }
}

// Ștergem o carte din lista locală
function deleteBook(id) {
    books = books.filter(function(book) {
        return book.id !== id;
    });

    displayBooks(books);
}

// Afișăm cărțile pe pagină
function displayBooks(bookList) {
    booksContainer.innerHTML = "";

    if (bookList.length === 0) {
        booksContainer.textContent = "Nu au fost găsite cărți.";
        return;
    }

    for (let i = 0; i < bookList.length; i++) {
        const book = bookList[i];

        const isAvailable = exemplars.some(function(exemplar) {
            return exemplar.book_id === book.id &&
                   exemplar.status === "available";
        });

        const status = isAvailable
            ? "Disponibilă"
            : "Indisponibilă";

        const statusClass = isAvailable
            ? "available"
            : "unavailable";

        const bookElement = document.createElement("div");
        bookElement.className = "book";

        const titleElement = document.createElement("h3");
        titleElement.textContent = book.title;

        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = book.description;

        const yearElement = document.createElement("p");
        yearElement.textContent = "Anul: " + book.publication_year;

        const isbnElement = document.createElement("p");
        isbnElement.textContent = "ISBN: " + book.isbn;

        const statusElement = document.createElement("p");
        statusElement.className = statusClass;
        statusElement.textContent = status;

        bookElement.appendChild(titleElement);
        bookElement.appendChild(descriptionElement);
        bookElement.appendChild(yearElement);
        bookElement.appendChild(isbnElement);
        bookElement.appendChild(statusElement);

        booksContainer.appendChild(bookElement);
    }
}

// Căutăm cărțile după titlu
function searchBooks() {
    const text = searchInput.value.toLowerCase().trim();

    const results = books.filter(function(book) {
        return book.title.toLowerCase().includes(text);
    });

    displayBooks(results);
}

// Încărcăm cărțile de la backend
async function loadBooks() {
    booksContainer.textContent = "Se încarcă cărțile...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Eroare HTTP: " + response.status);
        }

        const result = await response.json();

        // Backend-ul returnează { data: [...], meta: {...} }
        const bookList = Array.isArray(result)
            ? result
            : result.data;

        if (!Array.isArray(bookList)) {
            throw new Error("Formatul răspunsului este invalid.");
        }

        // Adaptăm datele backend-ului pentru interfață
        books = bookList.map(function(book) {
            return {
                id: book.id,
                title: book.title,
                description: book.description ??
                    ("Autor: " + (book.author ?? "Necunoscut")),
                category_id: book.category_id ?? null,
                publication_year:
                    book.publication_year ??
                    book.publicationYear ??
                    "Necunoscut",
                isbn: book.isbn ?? "Nespecificat"
            };
        });

        displayBooks(books);

    } catch (error) {
        console.error("Eroare la încărcarea cărților:", error);

        booksContainer.textContent =
            "Nu s-a putut realiza conexiunea cu backend-ul.";
    }
}

// Eveniment pentru butonul Search
searchButton.addEventListener("click", searchBooks);

// Permitem căutarea și cu tasta Enter
searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchBooks();
    }
});

// Pornim încărcarea cărților
loadBooks();
