<script>
export default {
  beforeCreate() {
    console.error('received before create here 1')
    const path = this.$route.params.path
    console.error('received before create here 2')
    console.error('/' + path)
    this.$router.replace('/' + path)
  },
  render: function(h) {
    return h() // avoid warning message
  }
}
</script>
