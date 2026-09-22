/*
#define MaxSize 10
#include<stdio.h>
#include<iostream>
using namespace std;
typedef struct{
	int data[MaxSize];
	int length;
}SqList;


void InsertList(SqList &l,int i,int e)
{
	for(int j=l.length;j>i;j--)  
	//00000
	//j=5 j>3 [4]给了[5]  （最后一位后移，注意位序和数组下标的不同
	//000000
	//j=4 j》3  [3]给了【4】 
	//000000
	//j=2?不通过，循环终止 
	{
		l.data[j]=l.data[j-1];
	}
	l.data[i]=e;//数组的第i个变成e，但是要求是第i位，也就是数组的第i-1位 
	l.length++;
	
}
int main()
{
	SqList l;
	l.length=5;
	for(int i=0;i<5;i++)
	{
		l.data[i]=0;
	}
	InsertList(l,3,3);
	for(int i=0;i<l.length;i++)
	{
	cout<<l.data[i];}
	return 0;
 } 
 
 
 */
 
 
#define MaxSize 10
#include<stdio.h>
#include<iostream>
using namespace std;
//顺序表结构体
typedef struct{
	int data[MaxSize];
	int length;
}SqList;



//插入函数 
InsertList(SqList &l,int i,int e)
{
	for(int j=l.length;j>=i;j--)
	{
		l.data[j]=l.data[j-1];
	}
	l.length++;
	l.data[i-1]=e;
}

 
int main()
{
	
	//使用结构体创建一个顺序表
	SqList l;
	
	//顺序表创建几个元素，注意把实际长度改一下
	l.length=5;
	for(int i=0;i<l.length;i++)
	{
		l.data[i]=0;
	}
	//插入元素
	InsertList(l,3,3);
	for(int i=0;i<l.length;i++)
	cout<<l.data[i];
	return 0; 
}


//调整代码，具有健壮性

bool InsertList(SqList &l,int i,int e)
{
	if(i<1||i>l.length+1)
	return false;
	if(i>MaxSize+1)
	return false;
	for(int j=i;j>=i;j--)
	{
		l.data[j]=l.data[j-1];
	}
	l.length++;
	l.data[i-1]=e;
	return true;
 } 
