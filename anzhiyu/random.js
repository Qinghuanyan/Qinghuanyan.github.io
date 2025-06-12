var posts=["2025/06/12/少年，孤身入局可惧否？/","2025/06/11/JavaNote/","2025/05/17/道友，故事的结局重要么？/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };