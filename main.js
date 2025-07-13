export let baseUrl = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;
// To Use It In The Scrolling Event
const posts = document.getElementById("posts");

getPosts();
setUpUI();

// ========= INFINITE SCROLL =========
window.addEventListener("scroll", function () {
  const bottomOfWindow =
    window.innerHeight + Math.ceil(window.pageYOffset) >=
    document.body.offsetHeight;
  if (bottomOfWindow && currentPage < lastPage && posts !== null) {
    currentPage = currentPage + 1;
    getPosts(false, currentPage);
  }
});
// =========// INFINITE SCROLL // =========

export async function getData(queryPar) {
  try {
    let mainRequest = await axios.get(`${baseUrl}${queryPar}`);
    return mainRequest;
  } catch (error) {
    appendAlert(error.response.data, "danger");
  }
}

export async function postData(queryPar, param, isFormData = false) {
  try {
    toggleLoader(true);

    const headers = isFormData ? { "Content-Type": "multipart/form-data" } : {};

    const response = await axios.post(`${baseUrl}${queryPar}`, param, {
      headers,
    });

    return response;
  } catch (error) {
    appendAlert(error.response.data.message || "Unknown error", "danger");
    throw error;
  } finally {
    toggleLoader(false);
  }
}

async function registerUser() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const image = document.getElementById("register-image").files[0];

  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  formData.append("name", name);
  formData.append("email", email);
  formData.append("image", image);

  const registerResponse = await postData("/register", formData, true);
  localStorage.setItem("token", registerResponse.data.token);
  localStorage.setItem("user", JSON.stringify(registerResponse.data.user));

  const modal = document.getElementById("register-Modal");
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();

  appendAlert(`Account Created Successfully!`, "success");
  setUpUI();
}

export async function loginBtnClicked() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const param = {
    username: username,
    password: password,
  };
  try {
    toggleLoader();
    let loginResponse = await axios.post(`${baseUrl}/login`, param);
    localStorage.setItem("token", loginResponse.data.token);
    localStorage.setItem("user", JSON.stringify(loginResponse.data.user));
    // Hiding the login modal
    const modal = document.getElementById("login-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    // Showing Log out Button
    setUpUI();
    // Showing Alert
    const user = JSON.parse(localStorage.getItem("user"));
    appendAlert(
      `You Logged In Successfully! Welcome Back ${user.username}`,
      "success"
    );
  } catch (error) {
    appendAlert(error.response.data.message, "danger");
  } finally {
    toggleLoader(false);
  }
}

async function getPosts(reload = true, page = 1) {
  try {
    toggleLoader();
    const fetchPost = await getData(`/posts?limit=5&page=${page}`);
    let processedPosts = await fetchPost.data.data;
    // Setting Last Page, Taking The Square Root Of The Returning Value Since The Num Is Large
    lastPage = Math.floor(Math.sqrt(fetchPost.data.meta.last_page));
    if (!posts) {
      // Stop When The Value Of Posts Becomes Null
      return;
    }
    if (reload && posts !== null) {
      posts.innerHTML = "";
    }

    for (let post of processedPosts) {
      // Showing Edit Button
      let editAndDeleteBtn = "";
      let user = currentUser();
      if (user !== null) {
        let isEditAndDelete = user.id === post.author.id;
        if (isEditAndDelete) {
          editAndDeleteBtn = `
        <div class="d-inline" style="float: right">
          <button
          class="btn btn-secondary"
          onclick="editPostBtnClicked(
            '${encodeURIComponent(JSON.stringify(post))}')"
            >
            Edit
          </button>
          <button
          class="btn btn-danger" id="delete-post-btn" onclick="deletePostBtnClicked(${
            post.id
          })"
            >
            Delete
          </button>
        </div>
        `;
        }
      }

      // The Tags will not be shown if there is no tag!
      let tags = post.tags;
      let tagContent = "";
      if (tags.length > 0) {
        for (let tag of tags) {
          tagContent += `<li id="tag">${tag.name}</li>`;
        }
      }
      posts.innerHTML += `<div id="post_${
        post.id
      }" class="col-12 col-md-9 post">
          <div class="card">
            <div class="card-header">
              <span onclick="showUserProfile(${
                post.author.id
              })" style="cursor:pointer">
                <img src="${getSafeImage(post.author.profile_image)}"
                class="img-fluid rounded-circle"
                style="width: 40px; height: 40px;"
                alt=""
                />
                <b>${post.author.username}</b>
              </span>
              ${editAndDeleteBtn}
            </div>
            <div class="card-body" onclick="showPostDetails(${
              post.id
            })" style="cursor:pointer">
              <img
                src= ${getSafeImage(
                  post.image,
                  "./assets/pexels-souvenirpixels-417074.jpg"
                )}
                alt=""
                class="img-fluid"
                style="height: 300px; width: 100%"
              />
              <p class="text-black-50">${post.created_at}</p>
              <h5 class="card-title">${
                post.title !== null ? post.title : ""
              }</h5>
              <p class="card-text">
                ${post.body}
              </p>
              <hr />
              <div class="d-flex flex-column justfiy-content-center align-items-center flex-md-row gap-3 gap-md-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-pen"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"
                  />
                </svg>
                <p style="display: inline; margin: 0">${
                  post.comments_count
                } comments <ul>${tagContent}</ul>  </p>
              </div>
            </div>
          </div>
        </div>`;
    }
  } catch (error) {
    console.log(error);
    appendAlert(error, "danger");
  } finally {
    toggleLoader(false);
  }
}

async function createAndEditPostClicked() {
  let postId = document.getElementById("post-id-input").value;
  let isCreate = postId == null || postId == "";
  const title = document.getElementById("create-post-title").value;
  const body = document.getElementById("create-post-body").value;
  const image = document.getElementById("create-post-image").files[0];
  const formData = new FormData();

  formData.append("title", title);
  formData.append("body", body);
  formData.append("image", image);

  const token = localStorage.getItem("token");
  const headers = {
    authorization: `Bearer ${token}`,
  };

  let url = "";

  try {
    if (isCreate) {
      url = `${baseUrl}/posts`;
    } else {
      // Since The API Does Not Accept Put Request Directly!
      formData.append("_method", "put");
      url = `${baseUrl}/posts/${postId}`;
    }
    await axios.post(`${url}`, formData, {
      headers: headers,
    });
    const modal = document.getElementById("create-post-modal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
    appendAlert(
      isCreate ? `Post Created Successfully` : `Post Updated Successfully`,
      "success"
    );
    // Refresh posts
    getPosts();
  } catch (error) {
    appendAlert(error.response.data.message, "danger");
  }
}

async function showPostDetails(post_id) {
  window.location = `postDetails.html?postId=${post_id}`;
}

function showUserProfile(id) {
  window.location = `userProfile.html?users=${id}`;
}

function showProfile() {
  const user = currentUser();
  const id = user.id;
  window.location = `userProfile.html?users=${id}`;
}

export function logoutBtnClicked() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  appendAlert(`Logged out Successfully!`, "success");
  window.location = "./home.html";
  // Showing Log in Button
  setUpUI();
}

export function editPostBtnClicked(postObject) {
  // Using Decode And Encode Since Using Javascript Object Inside
  // HTML Is Not Allowed
  let post = JSON.parse(decodeURIComponent(postObject));
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal")
  );
  document.getElementById("post-modal-head").innerHTML = "Edit Post";
  document.getElementById("create-post-btn").innerHTML = "Update";
  document.getElementById("create-post-title").value = post.title;
  document.getElementById("create-post-body").value = post.body;
  document.getElementById("post-id-input").value = post.id;
  postModal.toggle();
}

export function addPostBtnClicked() {
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal")
  );
  document.getElementById("post-modal-head").innerHTML = "Create A New Post";
  document.getElementById("create-post-btn").innerHTML = "Create";
  document.getElementById("create-post-title").value = "";
  document.getElementById("create-post-body").value = "";
  document.getElementById("post-id-input").value = "";
  postModal.toggle();
}

export function deletePostBtnClicked(postId) {
  let deletePostModal = new bootstrap.Modal(
    document.getElementById("delete-post-modal")
  );
  deletePostModal.show();
  let token = localStorage.getItem("token");
  const headers = {
    authorization: `Bearer ${token}`,
  };
  let deletePostBtn = document.getElementById("delete-post-submit");
  deletePostBtn.addEventListener(
    "click",
    () => {
      axios
        .delete(`${baseUrl}/posts/${postId}`, { headers })
        .then(() => {
          deletePostModal.hide();
          appendAlert("Post deleted successfully!", "success");
          window.location = "./home.html";
          // getPosts(false);
        })
        .catch((error) => {
          appendAlert(
            error?.response?.data?.message || "Unknown error",
            "danger"
          );
        });
    },
    { once: true } // Only One Time Executes!
  );
}

export function setUpUI() {
  const loginDiv = document.getElementById("login-div");
  const logoutDiv = document.getElementById("logout-div");
  const homeProfile = document.getElementById("home-profile");
  const addPost = document.getElementById("add-post");
  const userProfileImage = document.getElementById("profile-img");
  const loggedUsername = document.getElementById("login-username");
  const commentDiv = document.getElementById("comment-div");
  let token = localStorage.getItem("token");

  if (token == null) {
    loginDiv.style.setProperty("display", "flex", "important");
    logoutDiv.style.setProperty("display", "none", "important");
    if (addPost !== null)
      addPost.style.setProperty("display", "none", "important");
    if (commentDiv !== null) {
      commentDiv.style.setProperty("display", "none", "important");
    }
    if (homeProfile !== null)
      homeProfile.style.setProperty("display", "none", "important");
  } else {
    loginDiv.style.setProperty("display", "none", "important");
    logoutDiv.style.setProperty("display", "flex", "important");
    const userInfo = JSON.parse(localStorage.getItem("user"));
    // Show User Profile Image In The Page
    userProfileImage.setAttribute(
      "src",
      `${getSafeImage(userInfo.profile_image)}`
    );
    // Show Username In The Page
    loggedUsername.innerHTML = userInfo.username;
    // Show Add Post Button
    if (addPost !== null)
      addPost.style.setProperty("display", "flex", "important");
    if (commentDiv !== null) {
      commentDiv.style.setProperty("display", "flex", "important");
    }
    if (homeProfile !== null)
      homeProfile.style.setProperty("display", "flex", "important");
  }
}

export function appendAlert(message, type) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible" role="alert">
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  alertPlaceholder.append(wrapper);
  setTimeout(() => {
    wrapper.remove();
  }, 2000);
}

function toggleLoader(show = true) {
  const loader = document.getElementById("loader");
  if (loader) {
    if (show) {
      loader.style.visibility = "visible";
    } else {
      loader.style.visibility = "hidden";
    }
  }
}

// A Function To Set A Default Image If The User Did Not Put An Image
export function getSafeImage(
  url,
  fallback = "./assets/307ce493-b254-4b2d-8ba4-d12c080d6651.jpg"
) {
  if (
    typeof url !== "string" ||
    url.trim() === "" ||
    url === "null" ||
    url === "undefined" ||
    url === "#" ||
    url.toLowerCase().includes("localhost") ||
    url.toLowerCase().includes("default") ||
    !url.startsWith("http") // very basic format check
  ) {
    return fallback;
  }
  return url;
}

export function currentUser() {
  let user = null;
  if (
    localStorage.getItem("user") !== null ||
    localStorage.getItem("user") !== ""
  ) {
    user = JSON.parse(localStorage.getItem("user"));
  }
  return user;
}

// To Make it Accessible Globaly
window.logoutBtnClicked = logoutBtnClicked;
window.loginBtnClicked = loginBtnClicked;
window.registerUser = registerUser;
window.showPostDetails = showPostDetails;
window.createAndEditPostClicked = createAndEditPostClicked;
window.getSafeImage = getSafeImage;
window.editPostBtnClicked = editPostBtnClicked;
window.addPostBtnClicked = addPostBtnClicked;
window.deletePostBtnClicked = deletePostBtnClicked;
window.showUserProfile = showUserProfile;
window.showProfile = showProfile;
