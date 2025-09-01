import React from 'react'
import NavMenu from '../components/NavMenu'
import { Container } from "@bsf/force-ui";
import ConnectionCard  from './ConnectionCard.jsx'

const Connections = () => {
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
                        className="p-2 w-full"
                        shrink={1}
                    >
                      <ConnectionCard  />
                    </Container.Item>
                </Container>
      </div>
    </div>
  )
}

export default Connections