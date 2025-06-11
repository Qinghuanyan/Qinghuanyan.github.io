var posts=["2025/05/17/道友，故事的结局重要么？/","2025/06/11/JavaNote/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };