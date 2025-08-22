import React from 'react'
import NavMenu from '../components/NavMenu'
import WelcomeContainer from '../components/WelcomeContainer'
import QuickAccess from '../components/QuickAccess'
import { Container } from "@bsf/force-ui";
import Connection from './Connection'
import QuickSettings from './QuickSettings'
import ExtendWebsite from './ExtendWebsite'

const Dashboard = () => {
  return (
    <div id="surefeedback-dashboard-app" className="surefeedback-styles">
      <NavMenu />
      <div>
        <Container
                    align="stretch"
                    className="p-6 flex-col lg:flex-row box-border"
                    containerType="flex"
                    direction="row"
                    gap="sm"
                    justify="start"
                    style={{
                        width: "100%",
                    }}
                >
                    <Container.Item
                        className="p-2 ph_child-65-width"
                        alignSelf="auto"
                        order="none"
                        shrink={0}
                    >
                        <WelcomeContainer />
                         <QuickSettings />
                         <ExtendWebsite />
                    </Container.Item>
                    <Container.Item
                        className="p-2 w-full ph_child-35-width"
                        shrink={1}
                    >
                        {/* <UltimateFeatures /> */}
                        <QuickAccess />
                        <div className="mt-4">
                          <Connection />
                        </div>
                    </Container.Item>
                </Container>
      </div>
    </div>
  )
}

export default Dashboard