## example

const uiRoot = new Root()
.add(
  new VContainer()
    .options(Options)
  ,
  new HContainer()
    .options(Options)
    .add(
      new Button()
        .options(Options)
    )
)

<!-- **标准间距行为**: Root().add(VContainer(options).add(HContainer(options)))

**增加按钮行为**: Root().add(Button(options).on("event", function).position(x, y)) -->
