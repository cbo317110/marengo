#### Marengo
`Divide ut regnes` this words from some french famous guy, give us the oportunity to think about how sliced our web applications must be!

**THE PROBLEM!**

While developmenting an web application with vue, i see myself without freedom, (WHAT?) i choosed vue just cause it give to me freedom and speed. During 5 months my application become hard to maitain and to get done, because my scope are just too large, many remote content, many possible environmnets provided by our API, and also a lot of things to care about, like customization, translations, future changes provided by my bosses, then i se myself with the need of create/debug my components out of my application and i discover myself chained with vuex, router, and remote content that are provided by the global application! Scope problem? Maybe not, i need just much, much, discipline to get all content controlled by a single constructor, and i never wanted micro instances of vue.js!

**THE SOLUTION**

Marengo is vue.js helper component constructor to develop components fully independents, it handle locales, ajax content (if you want) and also have a middleware tool.

**Example**
``` typescript
import Marengo from 'marengo'

export default Marengo({
  config,
  middleware,
  resource,
  data(){
    return {
     foo: 'Bar'
    }
  },
  methods: {
    check(){
      this.foo = 'Bar'
    }
  }
})
```
