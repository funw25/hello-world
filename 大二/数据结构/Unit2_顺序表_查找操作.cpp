//按位查找 
//GetElem(l,i)

ElemType GetElem(Sqlist l,int i)
{
	return l.data[i-1];
}




//按值查找
Locate(SqList l,ElemType e)

int LocateElem(&l,e)//是否需要用引用？ 
{
	for(int i=0;i<length;i++)
	{
		if(l.data[i]==e)
		return i-1;
	}
 } 
 
