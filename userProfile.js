import {
  setUpUI,
  baseUrl,
  getSafeImage,
  currentUser,
  editPostBtnClicked,
  addPostBtnClicked,
  deletePostBtnClicked,
} from "./main.js";

const paramUrl = new URLSearchParams(window.location.search);
const myId = paramUrl.get("users");
setUpUI();
setProfileInfo(myId);
setPosts(myId);

export function setProfileInfo(id) {
  axios.get(`${baseUrl}/users/${id}`).then((response) => {
    let info = response.data.data;
    document.getElementById("email").innerHTML = info.email;
    document.getElementById("profile-image-of-user").src = getSafeImage(
      info.profile_image
    );
    document.getElementById("name").innerHTML = info.name;
    document.getElementById("username-of-user").innerHTML = info.username;
    document.getElementById("comments-num").innerHTML = info.comments_count;
    document.getElementById("posts-num").innerHTML = info.posts_count;
    document.getElementById(
      "username-heading"
    ).innerHTML = `${info.username}'s Posts`;
  });
}

export function setPosts(id) {
  axios.get(`${baseUrl}/users/${id}/posts`).then((response) => {
    let processedPosts = response.data.data;
    const posts = document.getElementById("my-posts");
    posts.innerHTML = "";
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
              <img src="${getSafeImage(post.author.profile_image)}"
                class="img-fluid rounded-circle"
                style="width: 40px; height: 40px;"
                alt=""
              />
              <b>${post.author.username}</b>
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
  });
}

window.editPostBtnClicked = editPostBtnClicked;
window.addPostBtnClicked = addPostBtnClicked;
window.deletePostBtnClicked = deletePostBtnClicked;
