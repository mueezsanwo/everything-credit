/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse} from 'next/server';  
import connectDB from '@/app/api/lib/mongodb';  
import { getUserFromRequest } from '@/app/api/lib/getUserFromRequest';  
import User from '@/models/User';  

export async function POST(request: Request) {  
  await connectDB();  

  const userId = await getUserFromRequest();  
  if (!userId) {  
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });  
  }  

  const user = await User.findById(userId);  
  if (!user) {  
    return NextResponse.json({ error: 'User not found' }, { status: 404 });  
  }  

  const body = await request.json();  
  const { bvn } = body;  

  if (!bvn) {  
    return NextResponse.json(  
      { error: 'BVN is required' },  
      { status: 400 }  
    );  
  }  

try {
    const bvnData = body.bvn;

    user.bvn = bvn;
    

    await user.save();

    return NextResponse.json(
      { message: 'BVN verified successfully', bvnData },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'BVN verification failed' },
      { status: 500 }
    );
  } 
}