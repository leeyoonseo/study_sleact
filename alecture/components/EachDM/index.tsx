// 분리한 코드 (사용x)
// import { IUser } from '@typings/db';
// import fetcher from '@utils/fetcher';
// import React, { useEffect, VFC } from 'react';
// import { useParams } from 'react-router';
// import { NavLink, useLocation } from 'react-router-dom';
// import useSWR from 'swr';

// interface Props {
//   member: IUser;
//   isOnline: boolean;
// }

// 분리했기 때문에 추가로 isOnline props를 받아야함: online여부를 보여주고 있으므로
// const EachDM: VFC<Props> = ({ member, isOnline }) => {
//   const { workspace } = useParams<{ workspace?: string }>();
//   const location = useLocation();
//   const { data: userData } = useSWR<IUser>('/api/users', fetcher, {
//     dedupingInterval: 2000, // 2초
//   });
//
// localStorage에 저장된 데이터 가져다 사용
//   const date = localStorage.getItem(`${workspace}-${member.id}`) || 0;
//   const { data: count, mutate } = useSWR<number>(
//     userData ? `/api/workspaces/${workspace}/dms/${member.id}/unreads?after=${date}` : null,
//     fetcher,
//   );

//   useEffect(() => {
//     if (location.pathname === `/workspace/${workspace}/dm/${member.id}`) {
//       mutate(0);
//     }
//   }, [mutate, location.pathname, workspace, member]);

//   return (
//     <NavLink key={member.id} activeClassName="selected" to={`/workspace/${workspace}/dm/${member.id}`}>
//       <i
//         className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
//           isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
//         }`}
//         aria-hidden="true"
//         data-qa="presence_indicator"
//         data-qa-presence-self="false"
//         data-qa-presence-active="false"
//         data-qa-presence-dnd="false"
//       />
//       <span className={count && count > 0 ? 'bold' : undefined}>{member.nickname}</span>
//       {member.id === userData?.id && <span> (나)</span>}
//       {(count && count > 0 && <span className="count">{count}</span>) || null}
//     </NavLink>
//   );
// };

// export default EachDM;