document.addEventListener("DOMContentLoaded", () => {
    let offset = 10;
    const limit = 10;
    // SEARCH BAR FUNCTIONALITY
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");
    const searchFilter = { value: "all" };

    // Restore state when returning from artist details
const savedOffset = parseInt(sessionStorage.getItem("offset")) || 10;
let restoreOffset = savedOffset;

// Load previously loaded artists
if (restoreOffset > 10) {
    let loaded = 10;
    const loadMoreSequentially = () => {
        if (loaded >= restoreOffset) {
            // Restore scroll position
            const savedScroll = parseInt(sessionStorage.getItem("scrollY")) || 0;
            window.scrollTo(0, savedScroll);
            return;
        }

        fetch(`/api/artists?offset=${loaded}&limit=${limit}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) return;
                data.forEach(artist => {
                    const card = document.createElement("div");
                    card.className = "artist-card";
                    const artistUrl = "/artist/" + artist.name.replace(/\s+/g, "-");

                    card.innerHTML = `
                        <a href="${artistUrl}">
                            <img src="${artist.image}" alt="${artist.name}" class="artist-img" />
                            <h3>${artist.name}</h3>
                        </a>
                    `;
                    artistList.appendChild(card);
                });
                loaded += limit;
                loadMoreSequentially();
            });
    };
    loadMoreSequentially();
}


    if (searchInput && suggestionsBox && searchFilter) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim().toLowerCase();
            const filter = searchFilter.value;

            if (query.length < 2) {
                suggestionsBox.innerHTML = "";
                return;
            }

            fetch(`/search?query=${encodeURIComponent(query)}&filter=${filter}`)
                .then((res) => res.json())
                .then((data) => {
                    suggestionsBox.innerHTML = "";

                    if (data.length === 0) {
                        const li = document.createElement("li");
                        li.textContent = "No results found";
                        li.className = "suggestion-item";
                        suggestionsBox.appendChild(li);
                        return;
                    }

                    data.forEach((result) => {
                        const li = document.createElement("li");
                        li.textContent = result.Value;
                        li.className = "suggestion-item";
                        li.onclick = () => {
                            window.location.href = `/artist/${result.Artist.replace(/\s+/g, "-")}`;
                        };
                        suggestionsBox.appendChild(li);
                    });
                })
                .catch((err) => {
                    console.error("Search suggestion error:", err);
                });
        });
    }

    // LOAD MORE FUNCTIONALITY
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const artistList = document.getElementById("artistList");

    if (loadMoreBtn && artistList) {
        loadMoreBtn.addEventListener("click", () => {
            fetch(`/api/artists?offset=${offset}&limit=${limit}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length === 0) {
                        loadMoreBtn.style.display = "none";
                        return;
                    }
        
                    data.forEach(artist => {
                        const card = document.createElement("div");
                        card.className = "artist-card";
                        const artistUrl = "/artist/" + artist.name.replace(/\s+/g, "-");
        
                        card.innerHTML = `
                            <a href="${artistUrl}">
                                <img src="${artist.image}" alt="${artist.name}" class="artist-img" />
                                <h3>${artist.name}</h3>
                            </a>
                        `;
                        artistList.appendChild(card);
                    });
        
                    offset += limit;
                    sessionStorage.setItem("offset", offset);
                    sessionStorage.setItem("scrollY", window.scrollY); // Save scroll position
                })
                .catch(err => {
                    console.error("Error loading more artists:", err);
                });
        });
        
    }

    // TOGGLE BUTTONS (if present)
    document.querySelectorAll('.toggle-section').forEach(function (button) {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const section = document.getElementById(targetId);
            if (section) {
                if (section.style.display === 'none') {
                    section.style.display = 'block';
                    this.innerText = 'Hide';
                } else {
                    section.style.display = 'none';
                    this.innerText = 'Show';
                }
            }
        });
    });
});
