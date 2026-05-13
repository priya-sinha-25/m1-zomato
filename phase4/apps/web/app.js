document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('preferences-form');
  const btnLoader = document.getElementById('btn-loader');
  const btnText = form.querySelector('.submit-btn span');
  const skeletonLoader = document.getElementById('skeleton-loader');
  const grid = document.getElementById('recommendations-grid');
  const statusMsg = document.getElementById('status-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI State: Loading
    btnLoader.classList.remove('hidden');
    btnText.textContent = "Analyzing...";
    skeletonLoader.classList.remove('hidden');
    grid.innerHTML = '';
    statusMsg.classList.add('hidden');
    
    // Build payload
    const location = document.getElementById('location').value.trim();
    const budget_bucket = document.getElementById('budget_bucket').value;
    const cuisine = document.getElementById('cuisine').value.trim();
    const min_rating = document.getElementById('min_rating').value;
    const extra_tags = document.getElementById('additional_preferences').value.trim();

    const payload = {
      location: location || undefined,
      budget_bucket: budget_bucket || undefined,
      cuisine: cuisine || undefined,
      min_rating: min_rating ? parseFloat(min_rating) : undefined,
      additional_preferences: extra_tags ? extra_tags.split(',').map(s=>s.trim()) : undefined,
      top_k: 5
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        renderRecommendations(result.data);
      } else if (result.status === 'empty') {
        showStatus(result.message || "No matches found.", "status-fallback");
      } else {
        showStatus(result.message || "An error occurred.", "status-error");
      }
    } catch (err) {
      showStatus("Failed to connect to the recommendation API.", "status-error");
      console.error(err);
    } finally {
      // UI State: Reset
      btnLoader.classList.add('hidden');
      btnText.textContent = "Find Restaurants";
      skeletonLoader.classList.add('hidden');
    }
  });

  function renderRecommendations(recommendations) {
    if (recommendations.length === 0) {
      showStatus("No restaurants found in the recommendations.", "status-fallback");
      return;
    }

    recommendations.forEach((rec, index) => {
      const card = document.createElement('div');
      card.className = 'restaurant-card';
      card.style.animationDelay = `${index * 0.1}s`;
      
      card.innerHTML = `
        <div class="card-header">
          <div class="card-title">${escapeHTML(rec.restaurant_name)}</div>
          <div class="card-rating">★ ${rec.rating.toFixed(1)}</div>
        </div>
        <div class="card-meta">
          <span>🍽️ ${escapeHTML(rec.cuisine || 'Various')}</span>
          <span>💰 ₹${rec.estimated_cost_for_two || 'N/A'} for two</span>
        </div>
        <div class="card-explanation">
          ${escapeHTML(rec.explanation)}
        </div>
      `;
      
      grid.appendChild(card);
    });
  }

  function showStatus(message, className) {
    statusMsg.textContent = message;
    statusMsg.className = `status-message ${className}`;
    statusMsg.classList.remove('hidden');
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
