// Sample data for demonstration
const posts = [
  { id: "test-post-1", title: "Post 1" },
  { id: "test-post-2", title: "Post 2" },
  { id: "test-post-3", title: "Post 3" },
];

// Initialize Supabase client
const supabaseUrl = "your-subabase-url";
const supabaseKey = "your-supabase-key";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Function to get visitor ID using FingerprintJS
async function getVisitorId() {
  try {
    // Initialize FingerprintJS
    const fpPromise = FingerprintJS.load();

    // Generate and handle fingerprint
    const fp = await fpPromise;
    const result = await fp.get();

    // Extract visitor ID from the result
    const visitorId = result.visitorId;

    // Return the visitor ID
    return visitorId;
  } catch (error) {
    console.error("Error getting visitor ID:", error);
    return null;
  }
}

// Function to query likes count for a particular post ID
async function getTotalLikesCountForPost(postId) {
  try {
    // Query the 'likes' table for likes count associated with the specified post ID
    const { data, error } = await supabaseClient
      .from("likes")
      .select("count", { count: "exact" }) // Get the count of likes
      .eq("post_id", postId);

    if (error) {
      throw error;
    }
    // Extract the likes count from the response
    const totalLikesCount = data ? data[0].count : 0;

    return totalLikesCount;
  } catch (error) {
    console.error("Error fetching total likes count:", error.message);
    return 0;
  }
}

// Function to find if the post is already liked post ID
async function isPostLiked(postId) {
  try {
    const visitorId = await getVisitorId();
    const { data, error } = await supabaseClient
      .from("likes")
      .select()
      .eq("post_id", postId)
      .eq("visitor_id", visitorId);

    if (error) {
      throw error;
    }
    return !!data.length;
  } catch (error) {
    console.error("Error verifying post liked:", error.message);
    return false;
  }
}

// Function to render posts
function renderPosts() {
  const postsContainer = document.getElementById("posts-container");
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    const titleElement = document.createElement("div");
    titleElement.classList.add("post-title");
    titleElement.textContent = post.title;

    const likeButton = document.createElement("button");
    likeButton.classList.add("like-button");
    likeButton.textContent = "Like";

    const likesCountElement = document.createElement("span");
    likesCountElement.classList.add("likes-count");

    likeButton.addEventListener("click", () =>
      likePost(post.id, likeButton, likesCountElement)
    );
    isPostLiked(post.id).then((isLiked) => {
      if (isLiked) {
        likeButton.textContent = "Liked";
        likeButton.classList.add("liked");
      }
    });
    // Fetch total likes count and update the likes count element
    getTotalLikesCountForPost(post.id)
      .then((totalLikesCount) => {
        likesCountElement.textContent = totalLikesCount;
      })
      .catch((error) => {
        console.error("Error fetching total likes count:", error.message);
        likesCountElement.textContent = "Error";
      });

    postElement.appendChild(titleElement);
    postElement.appendChild(likeButton);
    postElement.appendChild(likesCountElement);

    postsContainer.appendChild(postElement);
  });
}

// Function to simulate liking a post
async function likePost(postId, likeButton, likesCountElement) {
  const visitorId = await getVisitorId();
  if (!likeButton.classList.contains("liked")) {
    likeButton.classList.add("liked");
    likeButton.textContent = "Liked";
    try {
      // Add logic to send data to Supabase to indicate that the post has been liked
      const { data, error } = await supabaseClient.from("likes").insert({
        post_id: postId,
        visitor_id: visitorId,
      });

      if (error) {
        throw error;
      }

      // After liking, update the likes count element
      getTotalLikesCountForPost(postId)
        .then((totalLikesCount) => {
          likesCountElement.textContent = totalLikesCount;
        })
        .catch((error) => {
          console.error("Error fetching total likes count:", error.message);
          likesCountElement.textContent = "Error";
        });
    } catch (error) {
      console.error("Error recording like:", error.message);
    }
  } else {
    likeButton.textContent = "Like";
    likeButton.classList.remove("liked");
    // Add logic to send data to Supabase to indicate that the post has been unliked
    try {
      const { data, error } = await supabaseClient
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("visitor_id", visitorId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting like:", error.message);
    }
    // After unliking, update the likes count element
    getTotalLikesCountForPost(postId)
      .then((totalLikesCount) => {
        likesCountElement.textContent = totalLikesCount;
      })
      .catch((error) => {
        console.error("Error fetching total likes count:", error.message);
        likesCountElement.textContent = "Error";
      });
  }
}

// Render posts when the page loads
window.addEventListener("load", renderPosts);
