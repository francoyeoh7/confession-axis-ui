$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$index = Get-Content -LiteralPath (Join-Path $root 'index.html') -Raw
$css = Get-Content -LiteralPath (Join-Path $root 'styles.css') -Raw
$app = Get-Content -LiteralPath (Join-Path $root 'src\app.js') -Raw
$model = Get-Content -LiteralPath (Join-Path $root 'src\axis-model.js') -Raw

function Assert-True($condition, $message) {
  if (-not $condition) {
    throw $message
  }
}

Assert-True ($index -notmatch 'readout|id="prompt"|id="meta"') 'Unexpected extra readout UI is present.'
Assert-True ($index -match '<video') 'Background must be an mp4 video element.'
Assert-True ($index -match 'scene-background\.mp4') 'Background video source is missing.'
Assert-True ($index -notmatch 'scene-background\.png') 'Static PNG must not be used as the page background.'
Assert-True ($app -notmatch 'const replies') 'Jack reply must not be dynamic.'
Assert-True ($app -match 'const JACK_REPLY') 'Fixed Jack reply constant is missing.'
Assert-True ($app -notmatch 'promptLine|metaLine|choosePrompt') 'Unexpected extra prompt/meta logic is present.'
Assert-True ($app -match 'width:\s*1500' -and $app -match 'height:\s*650') 'Pointer mapping should use the requested 1500px by 650px axis field.'
Assert-True ($index -match 'id="axisHitArea"') 'Pointer interaction should use a dedicated 1500px by 650px hit area.'
Assert-True ($css -match '\.axis-hit-area[\s\S]*width:\s*1500px' -and $css -match '\.axis-hit-area[\s\S]*height:\s*650px') 'Axis hit area should not cover the full screen.'
Assert-True ($app -match 'axisHitArea\.addEventListener\("pointer' -and $app -notmatch 'uiStage\.addEventListener\("pointer') 'Pointer events should be bound to the axis hit area, not the full UI stage.'
Assert-True ($app -match 'window\.addEventListener\("pointermove"') 'Pointer movement should keep working when visible overlays sit above the axis hit area.'
Assert-True ($app -match 'dataset\.locked' -and $app -match 'isLocked') 'Confirmation should lock the selected state.'
Assert-True ($app -match 'dialogueChoice\.addEventListener\("click"') 'Clicking the yellow response area should confirm the selection.'
Assert-True ($app -match 'togglePreviewVisibility' -and $app -match 'previewHidden') 'Q should toggle the pre-confirmation axis and yellow preview visibility.'
Assert-True ($model -notmatch 'meta:') 'Axis model should not produce a second yellow/meta line.'
Assert-True ($model -match 'getAxisSegmentLengths') 'Axis model should expose dynamic segment lengths.'
Assert-True ($css -notmatch 'brightness\(') 'Background image brightness must not be reduced.'
Assert-True ($index -match 'axis-line--x' -and $index -match 'axis-line--y') 'Axis should render as one horizontal and one vertical line.'
Assert-True ($index -match 'sector-highlight') 'Selection hint should use a compact circular halo layer.'
Assert-True ($index -match 'quadrant-focus--q1' -and $index -match 'quadrant-focus--q2' -and $index -match 'quadrant-focus--q3' -and $index -match 'quadrant-focus--q4') 'Each quadrant should have an origin-anchored focus arc.'
Assert-True ($index -notmatch 'axis-line--x-left|axis-line--x-right|axis-line--y-top|axis-line--y-bottom') 'Axis should not render as visually separate split line elements.'
Assert-True ($css -match '--axis-left-length' -and $css -match '--axis-right-length') 'Horizontal axis segment CSS variables are missing.'
Assert-True ($css -match '--axis-top-length' -and $css -match '--axis-bottom-length') 'Vertical axis segment CSS variables are missing.'
Assert-True ($css -match '--axis-x-center' -and $css -match '--axis-y-center') 'Continuous axis gradient centers should track the origin.'
Assert-True ($css -match '--label-left-x' -and $css -match '--label-right-x') 'Horizontal labels should follow dynamic axis endpoints.'
Assert-True ($css -match '--label-top-y' -and $css -match '--label-bottom-y') 'Vertical labels should follow dynamic axis endpoints.'
Assert-True ($css -match '--focus-scale' -and $app -match '--focus-scale') 'Quadrant focus radius should respond to pointer distance from the axis origin.'
Assert-True ($css -match 'radial-gradient') 'Selection highlight should use a soft circular radial glow.'
Assert-True ($css -match '\.quadrant-focus[\s\S]*width:\s*330px' -and $css -match '\.quadrant-focus[\s\S]*height:\s*330px') 'Quadrant focus should be a substantial origin-anchored arc, not the tiny pointer halo.'
Assert-True ($css -match '\.quadrant-focus::before[\s\S]*border-radius:\s*999px') 'Quadrant focus should be built from a circular arc.'
Assert-True ($css -notmatch 'transparent\s+0\s+118px') 'Quadrant focus should not contain a visible yellow ring outline.'
Assert-True ($css -match '\.sector-highlight[\s\S]*left:\s*var\(--point-x\)' -and $css -match '\.sector-highlight[\s\S]*top:\s*var\(--point-y\)') 'Soft sector highlight should follow the selected point.'
Assert-True ($css -match '\.sector-highlight[\s\S]*width:\s*74px' -and $css -match '\.sector-highlight[\s\S]*height:\s*74px') 'Selection halo should stay compact like the Figma reference.'
Assert-True ($css -notmatch 'clip-path:\s*polygon') 'Quadrant highlight should not be a triangular polygon.'
Assert-True ($css -match '\.axis-stage[\s\S]*transition:[^;]*opacity\s+500ms') 'Axis stage should fade in/out over 0.5s.'
Assert-True ($css -match '\.sector-highlight[\s\S]*transition:[^;]*opacity\s+500ms') 'Soft sector should fade in/out over 0.5s.'
Assert-True ($css -match '\.dialogue__choice[\s\S]*transition:[^;]*opacity\s+500ms') 'Yellow preview should fade in/out over 0.5s.'
Assert-True ($css -match '\.confirm[\s\S]*transition:[^;]*opacity\s+500ms') 'F key icon should fade out over 0.5s.'
Assert-True ($css -match '\.confirm[\s\S]*width:\s*37px' -and $css -match '\.confirm[\s\S]*height:\s*37px') 'F key box should be scaled down by 20 percent.'
Assert-True ($css -match 'data-preview-hidden="true"') 'Preview hidden state should hide axis and yellow preview before confirmation.'
Assert-True ($css -match 'data-locked="true".*?\.axis-stage' -or $css -match 'scene\[data-locked="true"\]\s+\.axis-stage') 'Locked state should hide axis UI.'
Assert-True ($css -match 'data-locked="true".*?\.confirm' -or $css -match 'scene\[data-locked="true"\]\s+\.confirm') 'Locked state should hide the F key icon.'
Assert-True ($css -match 'left:\s*950px' -and $css -match 'top:\s*529px') 'Axis center mark should use Figma position.'
Assert-True ($css -match 'font-size:\s*24px') 'Primary axis labels should use Figma 24px size.'
Assert-True ($css -match 'font-size:\s*20px') 'Secondary axis labels should use Figma 20px size.'
Assert-True ($css -match 'transform:\s*scale\(0\.86\)') 'Inactive axis labels should be scaled down.'
Assert-True ($css -match 'color:\s*#fff5c4' -and $css -match 'transform:\s*scale\(1\.08\)') 'Selected axis labels should enlarge and use the warm Figma highlight color.'
Assert-True ($css -match 'white-space:\s*nowrap') 'Dialogue lines should stay as one line on desktop.'

'UI_CONTRACT_PASS'
