import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { RegionViewer } from '@gnomad/region-viewer'

import { labelForDataset } from '../datasets'
import DocumentTitle from '../DocumentTitle'
import GnomadPageHeading from '../GnomadPageHeading'
import { TrackPage, TrackPageSection } from '../TrackPage'
import EditRegion from './EditRegion'
import GenesInRegionTrack from './GenesInRegionTrack'
import RegionControls from './RegionControls'
import RegionCoverageTrack from './RegionCoverageTrack'
import RegionInfo from './RegionInfo'
import VariantsInRegion from './VariantsInRegion'
import StructuralVariantsInRegion from './StructuralVariantsInRegion'

const RegionInfoColumnWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;

  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: center;
  }

  /* Matches responsive styles in AttributeList */
  @media (max-width: 600px) {
    align-items: stretch;
  }
`

const RegionControlsWrapper = styled.div`
  @media (min-width: 1201px) {
    margin-top: 1em;
  }
`

// eslint-disable-next-line no-shadow
const RegionPage = ({ datasetId, history, region, width }) => {
  const { chrom, start, stop } = region

  const regionViewerRegions = [
    {
      feature_type: 'region',
      chrom,
      start,
      stop,
    },
  ]

  const smallScreen = width < 900

  // Subtract 30px for padding on Page component
  const regionViewerWidth = width - 30

  return (
    <TrackPage>
      <TrackPageSection>
        <DocumentTitle
          title={`${region.chrom}-${region.start}-${region.stop} | ${labelForDataset(datasetId)}`}
        />
        <GnomadPageHeading
          extra={<EditRegion initialRegion={region} style={{ marginLeft: '1em' }} />}
          selectedDataset={datasetId}
        >
          {`${region.chrom}-${region.start}-${region.stop}`}
        </GnomadPageHeading>
        <RegionInfoColumnWrapper>
          <RegionInfo region={region} />
          <RegionControlsWrapper>
            <RegionControls region={region} />
          </RegionControlsWrapper>
        </RegionInfoColumnWrapper>
      </TrackPageSection>
      <RegionViewer
        leftPanelWidth={115}
        padding={0}
        regions={regionViewerRegions}
        rightPanelWidth={smallScreen ? 0 : 160}
        width={regionViewerWidth}
      >
        <RegionCoverageTrack
          datasetId={datasetId}
          chrom={chrom}
          includeExomeCoverage={
            !datasetId.startsWith('gnomad_sv') && !datasetId.startsWith('gnomad_r3')
          }
          start={start}
          stop={stop}
        />

        <GenesInRegionTrack
          region={region}
          onClickGene={gene => {
            history.push(`/gene/${gene.gene_id}?dataset=${datasetId}`)
          }}
        />

        {datasetId.startsWith('gnomad_sv') ? (
          <StructuralVariantsInRegion
            datasetId={datasetId}
            region={region}
            width={regionViewerWidth}
          />
        ) : (
          <VariantsInRegion datasetId={datasetId} region={region} width={regionViewerWidth} />
        )}
      </RegionViewer>
    </TrackPage>
  )
}

RegionPage.propTypes = {
  datasetId: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  region: PropTypes.shape({
    reference_genome: PropTypes.oneOf(['GRCh37', 'GRCh38']).isRequired,
    chrom: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    stop: PropTypes.number.isRequired,
  }).isRequired,
  width: PropTypes.number.isRequired,
}

export default RegionPage
