import Workspace from '@layouts/Workspace';
import React from 'react'

const DirectMessage = () => {
  return (
    // 컴포넌트1. 각각의 layout을 가져와서 감싸는 방법
    // <Workspace>
    //   <div>로그인하신 것을 축하드려요!</div>
    // </Workspace>
    <div>로그인하신 것을 축하드려요!</div>
  )
}

export default DirectMessage;