#include<iostream>
#include<stdio.h>

#define MaxSize 10
using namespace std;
typedef struct{
	int data[MaxSize];
	int length;		
}SqList;


//删除函数

bool DeleteList(SqList &l,int i,int &e)//这里是引用型参数，把要删除的参数返回 
{
	//判断要删除的位置是否合法
	if (i<1||i>l.length)
	return false;

	e=l.data[i-1];
	//进行删除
	for(int j=i;j<l.length;j++)
	{
		l.data[j-1]=l.data[j];
	}
	
	
	//表的长度减一
	l.length--;
	return true;
	
 } 
 
 int main()
 {
 	
 	//创建一个顺序表
	 SqList l;
	 
	// 创建一些元素
	l.length=5;
	for(int i=0;i<l.length;i++)
	{
		l.data[i]=1;
	}
	
	
	//删除某个元素，调用删除函数
	//要定义一个和顺序表中的变量 同类型的变量
	//删除的元素通过上面的量返回 
	int e=0;
	DeleteList(l,2,e);
	
	//把被删除的元素带回来，告知一下用户  
	cout<<e;
 }
