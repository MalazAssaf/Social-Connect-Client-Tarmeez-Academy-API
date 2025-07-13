import {
  setUpUI,
  loginBtnClicked,
  logoutBtnClicked,
  appendAlert,
  getData,
  baseUrl,
  getSafeImage,
  currentUser,
  editPostBtnClicked,
  deletePostBtnClicked,
} from "./main.js";

const paramUrl = new URLSearchParams(window.location.search);
const id = paramUrl.get("postId");

loadPost();

async function loadPost() {
  if (!id) {
    appendAlert("Post Not Found", "danger");
    return;
  }
  try {
    const response = await getData(`/posts/${id}`);
    const post = response.data.data;
    // ========= Put Post Details ============
    const postElement = document.getElementById("post-details");
    // Put The Comments
    const comments = post.comments;
    let commentsContent = "";
    if (comments.length > 0) {
      for (let comment of comments) {
        commentsContent += `
        <div class="comment">
            <div id="comment-author-info" class="d-flex align-items-center"> 
                <img src="${getSafeImage(comment.author.profile_image)}"
                class="me-2 rounded-circle" style="width: 40px; height: 40px;" alt="">
                <h5>${comment.author.username}</h5>
            </div>
        <li id="comment">${comment.body}</li>
        </div>`;
      }
    }

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
    // Put the Tags
    let tags = post.tags;
    let tagContent = "";
    if (tags.length > 0) {
      for (let tag of tags) {
        tagContent += `<li id="tag">${tag.name}</li>`;
      }
    }
    postElement.innerHTML = `<h3 class="col-12 col-md-9 mt-2 mb-4 post">${
      post.author.username
    }</h3>
    <div id="post_${post.id}" class="col-12 col-md-9 post">
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
            <div class="card-body">
              <img
                src=${getSafeImage(
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
              <div>
                ${commentsContent}
              </div>
              <div class="d-flex align-items-center justify-content-between" id="comment-div">
                <input type="text" id="comment-input" class="p-1 m-2" placeholder="Add comment">
                <button onclick="addCommentToThePost()" class="btn btn-outline-primary">send</button>
              </div>
            </div>
          </div>
        </div>`;
    setUpUI();
  } catch (error) {
    appendAlert(error, "danger");
  }
}

function addCommentToThePost() {
  const token = localStorage.getItem("token");
  const headers = {
    authorization: `Bearer ${token}`,
  };
  const commmentInput = document.getElementById("comment-input").value;
  const body = commmentInput.trim();
  if (body === "") {
    appendAlert("Comment cannot be empty", "warning");
    return;
  }
  const param = { body };

  axios
    .post(`${baseUrl}/posts/${id}/comments`, param, {
      headers: headers,
    })
    .then(() => loadPost())
    .catch(function (error) {
      appendAlert(error.response.data.message, "danger");
    });
}

// To Make it Accessible Globaly
window.addCommentToThePost = addCommentToThePost;
