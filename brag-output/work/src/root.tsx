import {Composition} from "remotion"
import {Brag, TOTAL, type BragProps} from "./brag"

const defaultProps: BragProps = {soundtrack: "guitar"}

export function BragRoot() {
  return (
    <>
      <Composition
        id="Brag"
        component={Brag}
        defaultProps={defaultProps}
        durationInFrames={TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BragVertical"
        component={Brag}
        defaultProps={defaultProps}
        durationInFrames={TOTAL}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  )
}
