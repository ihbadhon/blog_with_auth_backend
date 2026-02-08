const API_URL = 'http://localhost:3000';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const contentType = response.headers.get('content-type');
  let result;
  
  if (contentType && contentType.includes('application/json')) {
    result = await response.json();
  } else {
    result = await response.text();
  }
  
  console.log(`\n${method} ${endpoint}`);
  console.log('Status:', response.status);
  console.log('Response:', typeof result === 'string' ? result : JSON.stringify(result, null, 2));
  
  return { status: response.status, data: result };
}

async function testCompleteFlow() {
  console.log('=== TESTING COMPLETE API FLOW ===\n');

  try {
    // 1. Register User 1 (Blog Owner)
    console.log('\n--- 1. REGISTER USER 1 (Blog Owner) ---');
    const timestamp = Date.now();
    const user1Registration = await apiCall('/auth/register', 'POST', {
      username: `blogger_${timestamp}`,
      password: 'password123'
    });
    const user1Token = user1Registration.data;

    // 2. Register User 2 (Commenter)
    console.log('\n--- 2. REGISTER USER 2 (Commenter) ---');
    const user2Registration = await apiCall('/auth/register', 'POST', {
      username: `commenter_${timestamp}`,
      password: 'password456'
    });
    const user2Token = user2Registration.data;

    // 3. User 1 Creates a Blog Post
    console.log('\n--- 3. USER 1 CREATES A BLOG POST ---');
    const blogCreation = await apiCall('/blogs', 'POST', {
      title: 'My First Blog Post',
      content: 'This is an amazing blog post about NestJS and Prisma. It covers authentication, blog creation, and commenting features.'
    }, user1Token);
    const blogId = blogCreation.data.id;

    // 4. Get All Blogs (Public)
    console.log('\n--- 4. GET ALL BLOGS (Public - No Auth) ---');
    await apiCall('/blogs/all', 'GET');

    // 5. Get Specific Blog (Public)
    console.log('\n--- 5. GET SPECIFIC BLOG (Public - No Auth) ---');
    await apiCall(`/blogs/all/${blogId}`, 'GET');

    // 6. User 2 Creates a Comment on User 1's Blog
    console.log('\n--- 6. USER 2 CREATES A COMMENT ---');
    const comment1Creation = await apiCall('/comment', 'POST', {
      content: 'Great post! Very informative.',
      blogId: blogId
    }, user2Token);
    const comment1Id = comment1Creation.data.id;

    // 7. User 1 Creates a Comment on Their Own Blog
    console.log('\n--- 7. USER 1 COMMENTS ON THEIR OWN BLOG ---');
    const comment2Creation = await apiCall('/comment', 'POST', {
      content: 'Thanks for reading!',
      blogId: blogId
    }, user1Token);
    const comment2Id = comment2Creation.data.id;

    // 8. Get All Comments for the Blog (Public)
    console.log('\n--- 8. GET ALL COMMENTS FOR THE BLOG (Public - No Auth) ---');
    await apiCall(`/comment/blog/${blogId}`, 'GET');

    // 9. User 2 Updates Their Own Comment
    console.log('\n--- 9. USER 2 UPDATES THEIR OWN COMMENT ---');
    await apiCall(`/comment/${comment1Id}`, 'PATCH', {
      content: 'Great post! Very informative. Updated: I learned a lot!'
    }, user2Token);

    // 10. User 2 Tries to Update User 1's Comment (Should Fail)
    console.log('\n--- 10. USER 2 TRIES TO UPDATE USER 1\'S COMMENT (Should Fail - 403) ---');
    await apiCall(`/comment/${comment2Id}`, 'PATCH', {
      content: 'Trying to update someone else\'s comment'
    }, user2Token);

    // 11. User 1 (Blog Owner) Deletes User 2's Comment
    console.log('\n--- 11. USER 1 (Blog Owner) DELETES USER 2\'S COMMENT ---');
    await apiCall(`/comment/${comment1Id}`, 'DELETE', null, user1Token);

    // 12. User 1 Creates Another Comment
    console.log('\n--- 12. USER 1 CREATES ANOTHER COMMENT ---');
    const comment3Creation = await apiCall('/comment', 'POST', {
      content: 'Another comment from me!',
      blogId: blogId
    }, user1Token);
    const comment3Id = comment3Creation.data.id;

    // 13. User 1 Deletes Their Own Comment
    console.log('\n--- 13. USER 1 DELETES THEIR OWN COMMENT ---');
    await apiCall(`/comment/${comment3Id}`, 'DELETE', null, user1Token);

    // 14. Final State: Get All Comments
    console.log('\n--- 14. FINAL STATE: GET ALL COMMENTS ---');
    await apiCall(`/comment/blog/${blogId}`, 'GET');

    // 15. User 1 Gets Their Blogs
    console.log('\n--- 15. USER 1 GETS THEIR BLOGS ---');
    await apiCall('/blogs/my-blogs', 'GET', null, user1Token);

    console.log('\n\n=== TEST COMPLETED SUCCESSFULLY ===');

  } catch (error) {
    console.error('\n\n=== TEST FAILED ===');
    console.error('Error:', error.message);
  }
}

// Run the test
testCompleteFlow();
