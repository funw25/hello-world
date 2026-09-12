// e13_01.cpp : 课程设计实例
//【学生】【老师】【课程】【选课】
//项目5个程序 = 主程序 + 上面 4 个 实体
#include "stdafx.h"
#include <Windows.h>
#include <conio.h> 
#include<iostream>
#include"Student.h"

//显示主菜单
void showMainMenu(){
	system("cls"); //清屏
	std::cout<<"1、学生管理"<<std::endl;
	std::cout<<"2、教师管理"<<std::endl;
	std::cout<<"3、课程管理"<<std::endl;
	std::cout<<"4、选课管理"<<std::endl;
	std::cout<<"Esc 退出系统"<<std::endl;

}

int main()
{
	//学生管理类实例
	StuManage stuMan;

	while(true){
		showMainMenu();
		//无回显的获取按键信息
		int nKey = _getch();
		if(nKey == 49){ //按下的是 '1'
			//交由学生管理类处理人机交互
			stuMan.handleMenu();
			//std::cout<<"\n学生管理\n";
			//_getch();
		}else if(nKey == 50){
			std::cout<<"\n教师管理\n";
			_getch();
		}else if(nKey == 51){
			std::cout<<"\n课程管理\n";
			_getch();
		}else if(nKey == 52){
			std::cout<<"\n选课管理\n";
			_getch();
		}else if(nKey == 27){//Esc
			break;
		}
	}
	
	return 0;
}

