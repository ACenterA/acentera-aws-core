<template>
  <div class="login-container">
    <div v-if="isLoginCodeReset">
      <el-form ref="codeConfirm" :model="codeConfirm" :rules="codeRules" class="login-form" auto-complete="on" label-position="left">
        <div class="title-container">
          <h3 class="title">{{ $t('login.passwordResetCodeConfirm') }}</h3>
          <lang-select class="set-language"/>
        </div>

        <el-form-item prop="username">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>

          <el-input
            v-model="codeConfirm.username"
            :placeholder="$t('login.username')"
            name="username"
            type="text"
            auto-complete="on"
            readonly
          />
        </el-form-item>

        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :type="passwordType"
            v-model="codeConfirm.password"
            :placeholder="$t('login.newPassword')"
            name="password"
            auto-complete="on"
            @keyup.enter.native="handleCodeConfirmChange" />
          <span class="show-pwd" @click="showPwd">
            <svg-icon icon-class="eye" />
          </span>
        </el-form-item>

        <el-form-item prop="code">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :type="text"
            v-model="codeConfirm.code"
            :placeholder="$t('login.code')"
            name="code"
            auto-complete="on"
            @keyup.enter.native="handleCodeConfirmChange" />
        </el-form-item>

        <el-button :loading="loading" type="primary" style="width:100%;margin-top:30px;margin-bottom:30px;" @click.native.prevent="handleCodeConfirmChange">{{ $t('login.updatePassword') }}</el-button>
        <el-button :loading="loading" type="secondary" style="width:100%;margin-top:30px;margin-bottom:30px;" @click.native.prevent="handleCancelCode">{{ $t('login.cancelUpdate') }}</el-button>
      </el-form>
    </div>

    <div v-if="!isLoginCodeReset && getCognitoUser">
      <el-form v-if="!getCognitoUser.code" ref="passwordChangeForm" :model="passwordChangeForm" :rules="passwordRules" class="login-form" auto-complete="on" label-position="left">
        <div class="title-container">
          <h3 class="title">{{ $t('login.passwordChangeTitle') }}</h3>
          <lang-select class="set-language"/>
        </div>

        <div v-if="getCognitoUser.challengeName == 'NEW_PASSWORD_REQUIRED'">

          <el-form-item prop="oldPassword">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>

            <el-input
              :type="passwordType"
              v-model="passwordChangeForm.oldPassword"
              :placeholder="$t('login.oldPassword')"
              name="password"
              auto-complete="on"
              @keyup.enter.native="handlePasswordChange" />
            <span class="show-pwd" @click="showPwd">
              <svg-icon icon-class="eye" />
            </span>
          </el-form-item>

          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :type="passwordType"
              v-model="passwordChangeForm.password"
              :placeholder="$t('login.password')"
              name="password"
              auto-complete="on"
              @keyup.enter.native="handlePasswordChange" />
            <span class="show-pwd" @click="showPwd">
              <svg-icon icon-class="eye" />
            </span>
          </el-form-item>

          <el-form-item prop="passwordConfirm">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :type="passwordType"
              v-model="passwordChangeForm.passwordConfirm"
              :placeholder="$t('login.passwordConfirm')"
              name="password"
              auto-complete="on"
              @keyup.enter.native="handlePasswordChange" />
            <span class="show-pwd" @click="showPwd">
              <svg-icon icon-class="eye" />
            </span>
          </el-form-item>

          <el-button :loading="loading" type="primary" style="width:100%;margin-top:30px;margin-bottom:30px;" @click.native.prevent="handlePasswordChange">{{ $t('login.updatePassword') }}</el-button>

        </div>

      </el-form>
    </div>
    <div v-if="!isLoginCodeReset && !getCognitoUser">
      <div v-if="isMissingEntry">
        <el-form v-if="activeName!='Forgot'" ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
          <div class="title-container">
            <lang-select class="set-language"/>
            <br><br><br>
            <h3 class="title">{{ $t('login.siteConfigError') }}</h3>
          </div>
        </el-form>
      </div>
      <el-form v-if="activeName!='Forgot'" ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
        <div class="title-container">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <lang-select class="set-language"/>
        </div>

        <div v-if="settings.firstTime" class="title-container" style="text-align:center;margin-bottom:30px;">
          <h5 class="titleFirstTime">{{ $t('login.firstTime') }}</h5>
          <h5 class="titleFirstTime">{{ $t('login.passwordOutput') }}</h5>
          <a :href="settings.stackUrl" style="text-align:center;margin:auto;width:auto;" target="_blank" class="titleFirstTime">{{ $t('login.clickHere') }}</a>
        </div>

        <el-form-item prop="username">
          <span class="svg-container svg-container_login">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            v-model="loginForm.username"
            :placeholder="$t('login.username')"
            name="username"
            type="text"
            auto-complete="on"
          />
        </el-form-item>

        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :type="passwordType"
            v-model="loginForm.password"
            :placeholder="$t('login.password')"
            name="password"
            auto-complete="on"
            @keyup.enter.native="handleLogin" />
          <span class="show-pwd" @click="showPwd">
            <svg-icon icon-class="eye" />
          </span>
        </el-form-item>

        <el-button v-if="activeName=='Login'" :loading="loading" type="primary" style="width:100%;margin-top:30px;margin-bottom:30px;" @click.native.prevent="handleLogin">{{ $t('login.logIn') }}</el-button>
        <el-button v-if="activeName=='Register'" :loading="loading" type="primary" style="width:100%;margin-top:30px;margin-bottom:30px;" @click.native.prevent="handleRegister">{{ $t('login.signUp') }}</el-button>
        <el-button v-if="!settings.firstTime && activeName=='Login'" :loading="loading" type="" style="width:100%;" @click.native.prevent="changeTo('Forgot')">{{ $t('login.forgotPassword') }}</el-button>

        <div class="tips" style="margin-top:30px"/>
        <el-button v-if="settings.allowRegister && activeName=='Login'" :loading="loading" type="secondary" style="width:auto;margin-bottom:30px;float: left;" @click.native.prevent="changeTo('Register')">{{ $t('login.signUp') }}</el-button>
        <el-button v-if="activeName=='Register'" :loading="loading" type="secondary" style="width:auto;margin-bottom:30px;float: left;" @click.native.prevent="changeTo('Login')">{{ $t('login.logIn') }}</el-button>
        <el-button :loading="loading" type="primary" style="display:none;width:30%;margin-bottom:30px;float: right;" @click="showDialog=true">{{ $t('login.thirdparty') }}</el-button>

      </el-form>

      <el-form v-if="activeName=='Forgot'" ref="loginForm" :model="loginForm" :rules="forgetPasswordRules" class="login-form" auto-complete="on" label-position="left">
        <div class="title-container">
          <h3 class="title">{{ $t('login.titleForgetPassword') }}</h3>
          <lang-select class="set-language"/>
        </div>

        <el-form-item prop="username">
          <span class="svg-container svg-container_login">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            v-model="loginForm.username"
            :placeholder="$t('login.username')"
            name="username"
            type="text"
            auto-complete="on"
          />
        </el-form-item>

        <el-button :loading="loading" type="primary" style="width:100%;margin-top:30px;margin-bottom:10px;" @click.native.prevent="handleForgotPassword">{{ $t('login.forgotPassword') }}</el-button>

        <div class="tips"/>
        <el-button v-if="settings.allowRegister" :loading="loading" type="secondary" style="width:auto;margin-bottom:30px;float: left;" @click.native.prevent="changeTo('Register')">{{ $t('login.signUp') }}</el-button>
        <el-button :loading="loading" type="secondary" style="width:auto;margin-bottom:30px;float: right;" @click.native.prevent="changeTo('Login')">{{ $t('login.logIn') }}</el-button>

      </el-form>
    </div>

    <el-dialog :title="$t('login.thirdparty')" :visible.sync="showDialog" append-to-body>
      {{ $t('login.thirdpartyTips') }}
      <br>
      <br>
      <br>
      <social-sign />
    </el-dialog>
  </div>
</template>

<script>
import { isvalidUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import SocialSign from './socialsignin'
import { mapGetters } from 'vuex'

export default {
  name: 'Login',
  components: { LangSelect, SocialSign },
  data() {
    const activeName = 'Login'

    const validateUsername = (rule, value, callback) => {
      if (!isvalidUsername(value)) {
        callback(new Error(this.$t('login.UsernameEmailRequirements')))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value && value.length < 6) {
        callback(new Error(this.$t('login.PasswordDigitRequirements'))) // 'The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      activeName,
      passwordChangeForm: {
        oldPassword: null,
        password: null,
        passwordConfirm: null
      },
      codeConfirm: {
        username: null,
        password: null,
        code: null
      },
      loginForm: {
        username: null,
        password: null,
        code: null
      },
      loginFormReset: {
        username: null,
        password: null,
        code: null
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      codeRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordRules: {
        oldPassword: [{ required: true, trigger: 'blur', validator: validatePassword }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        passwordConfirm: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      forgetPasswordRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }]
      },
      passwordType: 'password',
      loading: false,
      showDialog: false,
      redirect: undefined
    }
  },
  computed: {
    ...mapGetters(['getCognitoUser', 'isLoginCodeReset']),
    isCognitoConfigured: function() {
      try {
        if (this.$store && this.$store.getters && this.$store.getters.settings) {
          return !!this.$store.getters.settings.cognito.cognito.IDENTITY_POOL_ID
        }
      } catch (e) {
        return false
      }
    },
    settings: function() {
      if (this.$store.getters.settings) {
        return this.$store.getters.settings
      }
      return {}
    },
    isMissingEntry() {
      console.error('missing a')
      if (this.$store && this.$store.getters && this.$store.getters.settings) {
        console.error('missing b')
        return this.$store.getters.settings.missingSiteEntry === true
      }
      console.error('missing c')
      return false
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }

  },
  created() {
    // window.addEventListener('hashchange', this.afterQRScan)
  },
  destroyed() {
    // window.removeEventListener('hashchange', this.afterQRScan)
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    changeTo(tab) {
      this.activeName = tab
    },
    resetForm() {
      var tmp = this.loginForm['username']
      this.loginForm = this.loginFormReset
      this.loginForm['username'] = tmp
      this.passwordChangeForm['oldPassword'] = null
      this.passwordChangeForm['password'] = null
      this.passwordChangeForm['passwordConfirm'] = null
    },
    handleCancelCode() {
      this.loading = true
      this.$store.dispatch('UserPasswordChangeByCodeCancel').then(() => {
        this.resetForm()
        this.$router.push({ path: this.redirect || '/' })
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleCodeConfirmChange() {
      this.$refs.codeConfirm.validate(valid => {
        if (valid) {
          this.loading = true
          console.error('sending of')
          console.error(this.codeConfirm)
          this.$store.dispatch('UserPasswordChangeByCode', this.codeConfirm).then(() => {
            this.resetForm()
            this.$router.push({ path: this.redirect || '/' })
            var self = this
            setTimeout(function() {
              self.loading = false
            }, 2000)
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    handlePasswordChange() {
      this.$refs.passwordChangeForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('UserPasswordChange', this.passwordChangeForm).then(() => {
            this.resetForm()
            this.$router.push({ path: this.redirect || '/' })
            var self = this
            setTimeout(function() {
              self.loading = false
            }, 2000)
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('LoginByUsername', this.loginForm).then(() => {
            this.resetForm()
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },

    handleRegister() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('RegisterByUsernameCode', this.loginForm).then(() => {
            this.resetForm()
            this.changeTo('Login')
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },

    handleForgotPassword() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('LoginForgotPassword', this.loginForm).then((kk) => {
            console.error('hande login aa')
            console.error(kk)
            this.resetForm()
            this.changeTo('Login')
            this.loading = false
            if (kk) {
              this.codeConfirm.username = kk
            }
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },

    afterQRScan() {
      // const hash = window.location.hash.slice(1)
      // const hashObj = getQueryObject(hash)
      // const originUrl = window.location.origin
      // history.replaceState({}, '', originUrl)
      // const codeMap = {
      //   wechat: 'code',
      //   tencent: 'code'
      // }
      // const codeName = hashObj[codeMap[this.auth_type]]
      // if (!codeName) {
      //   alert('第三方登录失败')
      // } else {
      //   this.$store.dispatch('LoginByfzparty', codeName).then(() => {
      //     this.$router.push({ path: '/' })
      //   })
      // }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  /* 修复input 背景不协调 和光标变色 */
  /* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

  $bg:#283443;
  $light_gray:#eee;
  $cursor: #fff;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input{
      color: $cursor;
      &::first-line {
        color: $light_gray;
      }
    }
  }

  /* reset element-ui css */
  .login-container {
    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;
      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;
        &:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }
    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #454545;
    }
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

$break-small: 320px;
$break-large: 700px;

.title-container {
  padding-top:20px;
}

.el-button+.el-button {
    margin-left: 0px;
}

.login-container {
  overflow: auto;
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: $bg;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    max-width: 100%;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    &_login {
      font-size: 20px;
    }
  }
  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
    .titleFirstTime {
      color: $light_gray;
      margin: 0px auto 10px auto;
      text-align: center;
      font-weight: bold;
    }
    .set-language {
      color: #fff;
      position: absolute;
      top: 5px;
      right: 0px;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 35px;
    bottom: 28px;
  }
}

@media screen and (max-width: $break-large) {
  .login-container {
    .login-form {
      margin: 10px auto;
    }
  }
}

</style>
