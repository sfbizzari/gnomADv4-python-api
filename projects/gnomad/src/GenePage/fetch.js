import fetch from 'graphql-fetch'

const PUBLIC_API = 'http://gnomad-api.broadinstitute.org'
const API_URL = 'http://localhost:8007'
// const API_URL = 'http://35.185.9.245'


export const fetchLocal = (geneName, url = API_URL) => {
  const query = `{
    gene(gene_name: "${geneName}") {
      gene_id
      gene_name
      omim_accession
      full_gene_name
      start
      stop
      xstart
      xstop
      gnomadExomeVariants {
        variant_id
        rsid
        pos
        xpos
        hgvsc
        hgvsp
        allele_count
        allele_freq
        allele_num
        filters
        hom_count
        consequence
        lof
      }
      gnomadGenomeVariants {
        variant_id
        rsid
        pos
        xpos
        hgvsc
        hgvsp
        allele_count
        allele_freq
        allele_num
        filters
        hom_count
        consequence
        lof
      }
      exome_coverage {
        pos
        mean
      }
      genome_coverage {
        pos
        mean
      }
      transcript {
        exons {
          feature_type
          start
          stop
          strand
        }
      }
      exons {
        _id
        start
        transcript_id
        feature_type
        strand
        stop
        chrom
        gene_id
      }
  }
}
`
  return new Promise((resolve, reject) => {
    fetch(url)(query)
      .then(data => resolve(data.data.gene))
      .catch((error) => {
        reject(error)
      })
  })
}
export const fetchExac = (geneName, url = PUBLIC_API) => {
  const query = `{
    gene(gene_name: "${geneName}") {
      exacVariants: exacv1_variants {
        allele_count
        allele_freq
        allele_num
        chrom
        filters: filter
        hom_count
        pos
        ref
        rsid
        variant_id
        xpos
        xstart
        xstop
        vep_annotations {
          Consequence
        }
      }
      exacv1_constraint {
        mu_syn
        exp_syn
        cnv_z
        pLI
        syn_z
        n_lof
        n_mis
        n_syn
        lof_z
        tx_start
        mu_mis
        transcript
        n_cnv
        exp_lof
        mis_z
        exp_cnv
        tx_end
        n_exons
        mu_lof
        bp
        exp_mis
      }
      exacv1_coverage {
        xpos
        pos
        mean
      }
    }
  }
`
  return new Promise((resolve, reject) => {
    fetch(url)(query)
      .then(data => resolve(data.data.gene))
      .catch((error) => {
        reject(error)
      })
  })
}

export function fetchGene(geneName) {
  return Promise.all([
    fetchLocal(geneName),
    fetchExac(geneName),
  ]).then(([localData, publicData]) => {
    // console.log(publicData)
    const { exacVariants, ...rest } = publicData
    const modifiedExacVariants = exacVariants.map((v) => {
      return {
        consequence: v.vep_annotations[0].Consequence,
        ...v,
      }
    })
    console.log(modifiedExacVariants)
    return ({
      ...rest,
      exacVariants: modifiedExacVariants,
      ...localData
    })
  }).catch(error => console.log(error))
}
