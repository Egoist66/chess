<template>
  <div id="app">
    <header class="app-header">
      <h1>♔ Шахматы ♚</h1>
      <p>Классическая игра в шахматы</p>
    </header>
    <ChessBoard />
  </div>
</template>

<script setup lang="ts">
import ChessBoard from './components/ChessBoard.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #e8dcc4;
  min-height: 100vh;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-header {
  text-align: center;
  padding: 2rem;
  color: #3d2817;
}

.app-header h1 {
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.app-header p {
  font-size: 1.2rem;
  opacity: 0.8;
}
</style>

