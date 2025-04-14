document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");
    let activeSuggestionIndex = -1;
    let currentSuggestions = [];
  
    if (!searchInput || !suggestionsBox) return;
//------------------------------------------------------------------------------------------------
    //          ˅˅˅ ---> ---> Handle Enter key to filter artist cards on the homepage <--- <--- ˅˅˅
    searchInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
            const results = await response.json();
            const matchedIDs = new Set(results.map(r => r.ID));

            document.querySelectorAll(".artist-card").forEach(card => {
                const cardID = parseInt(card.dataset.artistId);
                if (matchedIDs.has(cardID)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });

            // Also hide suggestions on Enter
            suggestionsBox.innerHTML = "";
            currentSuggestions = [];
            activeSuggestionIndex = -1;
        }
    });
    //         ^^^ ---> ---> Handle Enter key to filter artist cards on the homepage <--- <--- ^^^
//------------------------------------------------------------------------------------------------

  
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      const filter = "all";
  
      if (query === "") {
        suggestionsBox.innerHTML = "";
        currentSuggestions = [];
        return;
      }
  
      fetch(`/search?query=${encodeURIComponent(query)}&filter=${filter}`)
        .then((res) => res.json())
        .then((data) => {
          suggestionsBox.innerHTML = "";
          activeSuggestionIndex = -1;
          currentSuggestions = data;
  
          if (!data || data.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No results found";
            li.className = "suggestion-item";
            suggestionsBox.appendChild(li);
            return;
          }
  
          data.forEach((result, index) => {
            const li = document.createElement("li");
            li.innerHTML = addEmojiToSuggestion(result);
            li.className = "suggestion-item";
            li.setAttribute("data-index", index);
  
            li.onclick = () => {
              window.location.href = `/artist/${result.Artist.replace(/\s+/g, "-")}`;
            };
  
            suggestionsBox.appendChild(li);
          });
        });
    });
  
    searchInput.addEventListener("keydown", (e) => {
      const items = suggestionsBox.querySelectorAll(".suggestion-item");
      if (!items.length) return;
  
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
        updateActiveSuggestion(items);
      }
  
      if (e.key === "ArrowUp") {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
        updateActiveSuggestion(items);
      }
  
      if (e.key === "Enter" && activeSuggestionIndex !== -1) {
        e.preventDefault();
        const result = currentSuggestions[activeSuggestionIndex];
        if (result) {
          window.location.href = `/artist/${result.Artist.replace(/\s+/g, "-")}`;
        }
      }
    });
  
    function updateActiveSuggestion(items) {
      items.forEach((item, index) => {
        if (index === activeSuggestionIndex) {
          item.classList.add("active-suggestion");
          item.scrollIntoView({ block: "nearest" });
        } else {
          item.classList.remove("active-suggestion");
        }
      });
    }
  
    function formatSuggestion(value) {
      const [rawText, type] = value.split(" — ");
      const formattedText = rawText
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return `${formattedText} — ${type}`;
    }
  
    function addEmojiToSuggestion(result) {
      const [rawText, type] = result.Value.split(" — ");
      const formattedText = formatSuggestion(result.Value);
      const normalizedType = type?.trim().toLowerCase();
      let emoji = "";
  
      switch (normalizedType) {
        case "artist/band":
          emoji = "🎤";
          break;
        case "member":
          emoji = "👤";
          break;
        case "location":
          emoji = "📍";
          break;
        case "creation":
        case "creation date":
          emoji = "📅";
          break;
        case "album":
        case "first album":
          emoji = "💿";
          break;
      }
  
      return `${emoji} ${formattedText}`;
    }
  });
  