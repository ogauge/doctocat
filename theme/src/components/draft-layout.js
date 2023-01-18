import componentMetadata from '@primer/component-metadata'
import {Box, Heading, Text, Label, StyledOcticon} from '@primer/react'
import {DotFillIcon} from '@primer/octicons-react'
import React from 'react'
import Head from './head'
import Header, {HEADER_HEIGHT} from './header'
import PageFooter from './page-footer'
import Sidebar from './sidebar'
import ReactLink from './react-link'
import SourceLink from './source-link'
import FigmaLink from './figma-link'
import RailsLink from './rails-link'
import DraftUnderlineNavigation from './draft-underline-navigation'
import DraftTableOfContents from './draft-table-of-contents'

const STATUS_COLORS = {
  alpha: 'severe.fg',
  beta: 'attention.fg',
  stable: 'success.fg',
  deprecated: 'danger.fg'
}

const STATUS_BACKGROUND = {
  alpha: 'severe.subtle',
  beta: 'attention.subtle',
  stable: 'success.subtle',
  deprecated: 'danger.subtle'
}

function getStatusColor(status) {
  return STATUS_COLORS[status.toLowerCase()] || 'fg.muted'
}

function getStatusBackgroundColor(status) {
  return STATUS_BACKGROUND[status.toLowerCase()] || 'neutral.subtle'
}

function StatusLabel({status, rails}) {
  return (
    <Label
      size="large"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: getStatusBackgroundColor(status),
        borderColor: 'transparent',
        fontWeight: 'normal'
      }}
    >
      <StyledOcticon icon={DotFillIcon} sx={{color: getStatusColor(status)}} />
      {status} {'in '} {rails ? 'Rails' : 'React'}
    </Label>
  )
}

function DraftLayout({children, pageContext, location}) {
  let {title, description, additionalContributors, componentId, statusReact, statusViewComponent, rails, react, figma} =
    pageContext.frontmatter

  if (!additionalContributors) {
    additionalContributors = []
  }

  const navigationItems = pageContext.tableOfContents.items

  const component = componentMetadata.components[componentId]

  // Auto-populate title and description using component metadata
  if (component) {
    title ||= component.displayName
    description ||= component.description
  }

  return (
    <Box sx={{flexDirection: 'column', minHeight: '100vh', display: 'flex'}}>
      <Head title={title} description={description} />
      <Header />
      <Box css={{zIndex: 0}} sx={{flex: '1 1 auto', flexDirection: 'row', display: 'flex'}}>
        <Box sx={{display: ['none', null, null, 'block']}}>
          <Sidebar />
        </Box>
        <Box
          id="skip-nav"
          sx={{
            justifyContent: 'center',
            flexDirection: 'row-reverse',
            display: 'flex',
            width: '100%',
            p: [4, 5, 6, 7]
          }}
        >
          {navigationItems ? (
            <Box
              sx={{
                width: 220,
                flex: '0 0 auto',
                marginLeft: 6,
                display: ['none', null, 'block'],
                position: 'sticky',
                top: HEADER_HEIGHT + 48,
                maxHeight: `calc(100vh - ${HEADER_HEIGHT}px - 48px)`
              }}
              css={{gridArea: 'table-of-contents', overflow: 'auto'}}
            >
              <Text sx={{display: 'inline-block', fontWeight: 'bold', pl: 3}} id="toc-heading">
                On this page
              </Text>
              <DraftTableOfContents aria-labelledby="toc-heading" items={navigationItems} />
            </Box>
          ) : null}
          <Box sx={{width: '100%', maxWidth: '960px'}}>
            <Box sx={{alignItems: 'center', display: 'flex', mb: 4}}>
              <Heading as="h1">{title}</Heading>
            </Box>
            {description ? <Box sx={{fontSize: 3, mb: 3}}>{description}</Box> : null}
            {/* <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: 3,
                mb: 7,
                mt: 2,
                rowGap: 3,
                alignItems: 'center',
                fontSize: 1
              }}
            >
              {statusReact || statusViewComponent ? (
                <Box
                  as={'ul'}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    m: 0,
                    p: 0,
                    paddingInline: 0,
                    listStyle: 'none'
                  }}
                >
                  <li>{statusReact ? <StatusLabel status={statusReact} /> : null}</li>
                  <li>{statusViewComponent ? <StatusLabel rails status={statusViewComponent} /> : null}</li>
                </Box>
              ) : null}
              {react || react || figma ? (
                <Box
                  as={'ul'}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                    alignItems: 'center',
                    m: 0,
                    p: 0,
                    paddingInline: 0,
                    listStyle: 'none'
                  }}
                >
                  {react ? <ReactLink href={react} /> : null}
                  {rails ? <RailsLink href={rails} /> : null}
                  {figma ? <FigmaLink href={figma} /> : null}
                  {react ? <SourceLink href={react} /> : null}
                </Box>
              ) : null}
            </Box> */}

            {navigationItems ? <DraftUnderlineNavigation items={navigationItems} /> : null}
            {children}
            <PageFooter
              editUrl={pageContext.editUrl}
              contributors={pageContext.contributors.concat(additionalContributors.map(login => ({login})))}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DraftLayout
